# FAQ Agent - Direct Google GenAI (no LangChain)
import os
from typing import List, Dict, AsyncGenerator
import asyncio

# Try to import RAG
try:
    from vector_store import get_vector_store
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

# Try direct Google Gen AI
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("[FAQAgent] google-generativeai not available")

# Quick cache
FAQ_CACHE: Dict[str, str] = {
    "what is fanfirst": """🎫 **FanFirst** is an AI-powered NFT ticketing platform that ensures real fans get access to tickets before scalpers and bots.

**Key Features:**
- 🛡️ Anti-bot protection via FanIQ Quiz
- 🎟️ NFT tickets stored on blockchain
- 📊 Fandom Score for early access
- 💰 Smart resale caps to prevent scalping

FanFirst prioritizes REAL FANS over profits, unlike traditional ticketing platforms!""",

    "how does": """Here's how FanFirst works:

1️⃣ **Create Account** - Sign up and connect wallet
2️⃣ **Prove Fandom** - Take FanIQ quiz to verify you're a real fan
3️⃣ **Get Priority** - Higher Fandom Score = earlier access
4️⃣ **Buy Tickets** - NFT tickets minted to your wallet
5️⃣ **Attend Event** - Show QR code at venue

Simple, secure, and fair!""",

    "difference": """🆚 **FanFirst vs Traditional Ticketing**

**FanFirst:**
- ✅ FanIQ Quiz prevents bots/scalpers
- ✅ NFT tickets can't be faked
- ✅ Resale caps prevent price gouging
- ✅ Artists earn royalties on resales
- ✅ Real fans get priority access

**Traditional (Ticketmaster):**
- ❌ Bots buy tickets in seconds
- ❌ Scalpers resell at 10x prices
- ❌ No fan verification
- ❌ Artists get nothing from resales

FanFirst puts FANS FIRST! 🎉""",

    "ticketmaster": """🆚 **FanFirst vs Ticketmaster**

**FanFirst:**
- ✅ FanIQ Quiz prevents bots/scalpers
- ✅ NFT tickets can't be faked
- ✅ Resale caps prevent price gouging
- ✅ Artists earn royalties on resales

**Ticketmaster:**
- ❌ Bots buy tickets in seconds
- ❌ Scalpers resell at 10x prices
- ❌ No fan verification

FanFirst puts FANS FIRST! 🎉""",

    "safe": """🔒 **Your Data is Safe**

FanFirst security:
- Auth0 for secure authentication
- Encrypted connections (HTTPS)
- Non-custodial wallet - we never access your funds
- Spotify only reads following list, not listening history
- Blockchain transparency

Your data is never sold!""",

    "help": """👋 **Welcome to FanFirst Support!**

I can help with:
- 🎫 **Tickets** - Buying, refunds, transfers
- 🎵 **Events** - Find concerts, games, shows
- 👤 **Account** - Wallet, profile, Fandom Score

Just ask your question!""",
}


def find_cached_response(message: str) -> str | None:
    msg_lower = message.lower()
    for key in FAQ_CACHE:
        if key in msg_lower:
            return FAQ_CACHE[key]
    return None


class FAQAgent:
    """FAQ with Cache → RAG → Direct GenAI"""
    
    def __init__(self):
        self._model = None
        self._vector_store = None
    
    @property
    def model(self):
        if self._model is None and GENAI_AVAILABLE:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                try:
                    genai.configure(api_key=api_key)
                    self._model = genai.GenerativeModel('gemini-2.0-flash')
                    print("[FAQAgent] Gemini model initialized ✓")
                except Exception as e:
                    print(f"[FAQAgent] Model init failed: {e}")
        return self._model
    
    @property
    def vector_store(self):
        if self._vector_store is None and RAG_AVAILABLE:
            try:
                self._vector_store = get_vector_store()
            except Exception as e:
                print(f"[FAQAgent] Vector store init failed: {e}")
        return self._vector_store
    
    async def stream_response(
        self, 
        message: str, 
        history: List[Dict]
    ) -> AsyncGenerator[str, None]:
        
        # LAYER 1: Check exact cache (instant, free)
        cached = find_cached_response(message)
        if cached:
            print(f"[FAQAgent] Cache hit!")
            for i in range(0, len(cached), 25):
                yield cached[i:i+25]
            return
        
        # LAYER 2: RAG search for context
        context = ""
        if self.vector_store:
            try:
                context = self.vector_store.get_context(message)
                if context:
                    print(f"[FAQAgent] RAG context found ({len(context)} chars)")
            except Exception as e:
                print(f"[FAQAgent] RAG error: {e}")
        
        # LAYER 3: Direct Gemini API call
        if self.model:
            try:
                if context:
                    prompt = f"""You are FAQ support for FanFirst NFT ticketing platform.
Use the following knowledge to answer accurately.

KNOWLEDGE BASE:
{context}

USER: {message}

Answer helpfully and concisely (2-4 sentences). Use emojis."""
                else:
                    prompt = f"""You are FAQ support for FanFirst NFT ticketing.
FanFirst is an anti-scalper NFT ticketing platform with:
- FanIQ Quiz to verify real fans
- NFT tickets on blockchain
- Fandom Score for early access
- Resale caps to prevent gouging

USER: {message}

Answer briefly:"""
                
                print(f"[FAQAgent] Calling Gemini...")
                response = await asyncio.to_thread(
                    self.model.generate_content, 
                    prompt
                )
                result = response.text
                print(f"[FAQAgent] Gemini response: {len(result)} chars")
                
                # Stream in chunks
                for i in range(0, len(result), 25):
                    yield result[i:i+25]
                return
                
            except Exception as e:
                print(f"[FAQAgent] Gemini error: {e}")
        
        # LAYER 4: Fallback
        fallback = """❓ I couldn't find specific info for that question.

Try asking about:
- What is FanFirst?
- How does FanFirst work?
- Difference from Ticketmaster

Or email support@fanfirst.com"""
        
        for i in range(0, len(fallback), 25):
            yield fallback[i:i+25]
