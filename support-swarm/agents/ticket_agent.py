# Ticket Agent - Hybrid: Cache → RAG → LLM
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import List, Dict, AsyncGenerator
import os

try:
    from vector_store import get_vector_store
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

# Priority-ordered keywords for cache
TICKET_KEYWORDS = [
    ("cancel", """❌ **Ticket Cancellation**

- **Event cancelled:** Full automatic refund
- **Self-cancel:** Within 48hrs of purchase
- **Can't attend:** List for resale instead!

Go to: Dashboard → My Tickets → Request Refund"""),

    ("refund", """💰 **Refund Policy**

- Event cancelled → Full refund auto
- Event postponed → Refund or keep ticket
- Within 48hrs → Full refund minus gas

Dashboard → My Tickets → Request Refund"""),

    ("transfer", """🔄 **Transfer Ticket**

1. Dashboard → My Tickets
2. Select ticket → Transfer
3. Enter wallet address
4. Confirm

Free to transfer, resale caps still apply!"""),

    ("qr", """📱 **QR Code**

1. Dashboard → My Tickets
2. Select ticket → Show QR
3. Show at venue

Activates 24hrs before event!"""),

    ("resale", """💸 **Resale Ticket**

1. Dashboard → My Tickets
2. Select → List for Sale
3. Set price (max 120% of original)

Artist gets 10% royalty on resales."""),

    ("buy", """🎫 **Buy Tickets**

1. Browse at /events
2. Pass FanIQ Quiz
3. Connect wallet
4. Purchase → NFT minted to wallet!"""),
]


def find_ticket_cache(message: str) -> str | None:
    msg_lower = message.lower()
    for keyword, response in TICKET_KEYWORDS:
        if keyword in msg_lower:
            return response
    return None


class TicketAgent:
    """Ticket support with Hybrid: Cache → RAG → LLM"""
    
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
                except Exception as e:
                    print(f"[TicketAgent] LLM init failed: {e}")
        return self._llm
    
    @property
    def vector_store(self):
        if self._vector_store is None and RAG_AVAILABLE:
            try:
                self._vector_store = get_vector_store()
            except Exception as e:
                print(f"[TicketAgent] Vector store init failed: {e}")
        return self._vector_store
    
    async def stream_response(
        self, 
        message: str, 
        history: List[Dict], 
        db=None,
        user_id: str = None
    ) -> AsyncGenerator[str, None]:
        
        # LAYER 1: Cache
        cached = find_ticket_cache(message)
        if cached:
            print(f"[TicketAgent] Cache hit!")
            for i in range(0, len(cached), 20):
                yield cached[i:i+20]
            return
        
        # LAYER 2: RAG
        context = ""
        if self.vector_store:
            try:
                context = self.vector_store.get_context(message)
                if context:
                    print(f"[TicketAgent] RAG context found")
            except Exception as e:
                print(f"[TicketAgent] RAG error: {e}")
        
        # LAYER 3: LLM with context
        if self.llm:
            try:
                if context:
                    prompt = f"""You are Ticket Support for FanFirst.
Use this knowledge to answer:

{context}

USER: {message}

Reply helpfully (2-3 sentences):"""
                else:
                    prompt = f"""You are Ticket Support for FanFirst.
Help with: purchases, refunds, transfers, QR codes, resale.
Be brief.

User: {message}

Reply:"""
                
                async for chunk in self.llm.astream([HumanMessage(content=prompt)]):
                    if chunk.content:
                        yield chunk.content
                return
            except Exception as e:
                print(f"[TicketAgent] LLM error: {e}")
        
        # LAYER 4: Fallback
        fallback = """🎫 **Ticket Support**

Quick help:
- Refunds: Dashboard → My Tickets
- Transfer: Select ticket → Transfer
- QR Code: Select ticket → Show QR

Email: support@fanfirst.com"""
        
        for i in range(0, len(fallback), 20):
            yield fallback[i:i+20]
