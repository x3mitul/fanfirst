# Account Agent - Hybrid: Cache → RAG → LLM
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import List, Dict, AsyncGenerator
import os

try:
    from vector_store import get_vector_store
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

ACCOUNT_CACHE = {
    "wallet": """🔗 **Connect Wallet**

1. Click "Connect Wallet" in header
2. Choose: MetaMask (EVM) or Phantom (Solana)
3. Approve connection

Your wallet is needed to buy NFT tickets!""",

    "fandom": """📊 **Fandom Score**

Earn points:
- Attend events: +50
- Community posts: +10
- FanIQ Quiz: +5-25
- Get vouched: +15

Higher score = earlier ticket access!""",

    "spotify": """🎵 **Spotify**

Dashboard → Settings → Connect Spotify

Benefits:
- Boost Fandom Score
- Personalized recommendations

Your data stays private!""",
}


def find_account_cache(message: str) -> str | None:
    msg_lower = message.lower()
    for key in ACCOUNT_CACHE:
        if key in msg_lower:
            return ACCOUNT_CACHE[key]
    return None


class AccountAgent:
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
        db=None,
        user_id: str = None
    ) -> AsyncGenerator[str, None]:
        
        cached = find_account_cache(message)
        if cached:
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
                prompt = f"""You are Account Support for FanFirst.
{f'Context: {context}' if context else ''}

User: {message}

Brief reply:"""
                
                async for chunk in self.llm.astream([HumanMessage(content=prompt)]):
                    if chunk.content:
                        yield chunk.content
                return
            except: pass
        
        fallback = "Check Dashboard → Settings or email support@fanfirst.com"
        yield fallback
