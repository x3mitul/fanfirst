# Event Agent - Hybrid: Cache → RAG → LLM
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import List, Dict, AsyncGenerator
import os

try:
    from vector_store import get_vector_store
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

EVENTS_INFO = """🎫 **Upcoming Events**

🏀 LA Lakers vs Boston Celtics
   March 15, 2025 | Crypto.com Arena

🎤 Taylor Swift - Eras Tour
   April 10, 2025 | SoFi Stadium

🎵 Drake Concert
   May 5, 2025 | Staples Center

Browse all: /events"""

EVENT_CACHE = {
    "lakers": """🏀 **LA Lakers**

Next: Lakers vs Celtics
📅 March 15, 2025
📍 Crypto.com Arena
🎟️ Tickets from $125

Browse at /events?search=lakers""",

    "taylor": """🎤 **Taylor Swift - Eras Tour**

📅 April 10, 2025
📍 SoFi Stadium
🎟️ Limited availability!

Get tickets at /events""",
    
    "upcoming": EVENTS_INFO,
    "events": EVENTS_INFO,
    "when": EVENTS_INFO,
}


class EventAgent:
    def __init__(self):
        self._llm = None
        self._vector_store = None
    
    @property
    def llm(self):
        if self._llm is None:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                try:
                    self._llm = ChatGoogleGenerativeAI(
                        model="gemini-1.5-flash",
                        google_api_key=api_key,
                        temperature=0.7,
                        streaming=True,
                    )
                except: pass
        return self._llm
    
    @property
    def vector_store(self):
        if self._vector_store is None and RAG_AVAILABLE:
            try:
                self._vector_store = get_vector_store()
            except: pass
        return self._vector_store
    
    async def stream_response(
        self, 
        message: str, 
        history: List[Dict], 
        db=None
    ) -> AsyncGenerator[str, None]:
        
        msg_lower = message.lower()
        for key in EVENT_CACHE:
            if key in msg_lower:
                cached = EVENT_CACHE[key]
                for i in range(0, len(cached), 20):
                    yield cached[i:i+20]
                return
        
        context = ""
        if self.vector_store:
            try:
                context = self.vector_store.get_context(message)
            except: pass
        
        if self.llm:
            try:
                prompt = f"""You are Event Info for FanFirst.
{f'Context: {context}' if context else ''}
Events: Lakers games, Taylor Swift, Drake, Hamilton

User: {message}

Brief reply:"""
                
                async for chunk in self.llm.astream([HumanMessage(content=prompt)]):
                    if chunk.content:
                        yield chunk.content
                return
            except: pass
        
        for i in range(0, len(EVENTS_INFO), 20):
            yield EVENTS_INFO[i:i+20]
