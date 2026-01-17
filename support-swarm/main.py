# Customer Support Swarm - Main Server with RAG
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load env files
parent_dir = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(parent_dir, '.env'))
load_dotenv(os.path.join(parent_dir, '.env.local'), override=True)
load_dotenv('.env')
load_dotenv('.env.local', override=True)

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
print(f"[Support Swarm] GEMINI_API_KEY: {'SET ✓' if GEMINI_KEY else 'NOT SET ✗'}")

# Import after env is loaded
from db import init_db
from agents import RouterAgent, TicketAgent, EventAgent, AccountAgent, FAQAgent

# Try to initialize RAG
try:
    from vector_store import get_vector_store
    RAG_ENABLED = True
    print("[Support Swarm] RAG: ENABLED ✓")
except Exception as e:
    RAG_ENABLED = False
    print(f"[Support Swarm] RAG: DISABLED - {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    
    # Pre-load vector store
    if RAG_ENABLED:
        try:
            vs = get_vector_store()
            print(f"[Support Swarm] Vector store loaded with {vs.collection.count()} docs")
        except Exception as e:
            print(f"[Support Swarm] Vector store init error: {e}")
    
    print("✅ Customer Support Swarm initialized!")
    yield

app = FastAPI(
    title="Customer Support Swarm",
    description="Multi-agent AI support with RAG",
    version="1.1.0",
    lifespan=lifespan
)

# CORS origins from environment variable or default to localhost
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
router_agent = RouterAgent()
ticket_agent = TicketAgent()
event_agent = EventAgent()
account_agent = AccountAgent()
faq_agent = FAQAgent()

# In-memory storage
conversations: Dict[str, List[Dict]] = {}


class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None
    visitor_id: Optional[str] = None


@app.get("/")
async def root():
    return {
        "service": "Customer Support Swarm",
        "status": "running",
        "rag_enabled": RAG_ENABLED,
        "gemini": bool(GEMINI_KEY),
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "gemini": bool(GEMINI_KEY), "rag": RAG_ENABLED}


def get_or_create_conversation(conversation_id: Optional[str], visitor_id: str) -> str:
    if conversation_id and conversation_id in conversations:
        return conversation_id
    new_id = conversation_id or str(uuid.uuid4())
    conversations[new_id] = []
    return new_id


def save_message(conversation_id: str, role: str, content: str, agent_type: str = None):
    if conversation_id not in conversations:
        conversations[conversation_id] = []
    conversations[conversation_id].append({
        "role": role, "content": content, "agent_type": agent_type
    })


def get_history(conversation_id: str) -> List[Dict]:
    return conversations.get(conversation_id, [])


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    connection_id = str(uuid.uuid4())
    print(f"🔌 Connected: {connection_id}")
    
    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message", "")
            conversation_id = data.get("conversation_id")
            visitor_id = data.get("visitor_id", f"anon_{uuid.uuid4().hex[:8]}")
            user_id = data.get("user_id")
            
            if not message:
                continue
            
            print(f"📩 Query: {message[:50]}...")
            
            conversation_id = get_or_create_conversation(conversation_id, visitor_id)
            save_message(conversation_id, "user", message)
            history = get_history(conversation_id)
            
            # Route
            agent_type, routing_msg = await router_agent.classify(message)
            agent_desc = router_agent.get_agent_description(agent_type)
            print(f"🎯 Routed to: {agent_type}")
            
            await websocket.send_json({
                "type": "routing",
                "conversation_id": conversation_id,
                "agent_type": agent_type,
                "agent_description": agent_desc,
                "message": routing_msg
            })
            
            # Stream response
            full_response = ""
            
            try:
                if agent_type == "ticket":
                    async for chunk in ticket_agent.stream_response(message, history, None, user_id):
                        full_response += chunk
                        await websocket.send_json({"type": "stream", "content": chunk, "agent_type": agent_type})
                elif agent_type == "event":
                    async for chunk in event_agent.stream_response(message, history, None):
                        full_response += chunk
                        await websocket.send_json({"type": "stream", "content": chunk, "agent_type": agent_type})
                elif agent_type == "account":
                    async for chunk in account_agent.stream_response(message, history, None, user_id):
                        full_response += chunk
                        await websocket.send_json({"type": "stream", "content": chunk, "agent_type": agent_type})
                else:  # FAQ
                    async for chunk in faq_agent.stream_response(message, history):
                        full_response += chunk
                        await websocket.send_json({"type": "stream", "content": chunk, "agent_type": agent_type})
                
                print(f"✅ Response generated ({len(full_response)} chars)")
                        
            except Exception as e:
                print(f"❌ Agent error: {e}")
                import traceback
                traceback.print_exc()
                full_response = f"Sorry, I encountered an issue. Please try again."
                await websocket.send_json({"type": "stream", "content": full_response, "agent_type": agent_type})
            
            save_message(conversation_id, "assistant", full_response, agent_type)
            await websocket.send_json({"type": "complete", "conversation_id": conversation_id, "agent_type": agent_type})
    
    except WebSocketDisconnect:
        print(f"🔌 Disconnected: {connection_id}")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
