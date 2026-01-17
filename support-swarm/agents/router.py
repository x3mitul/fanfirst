# Router Agent - Smart routing with exclusions
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import Literal, Tuple, Dict, List
import os
import re

AgentType = Literal["ticket", "event", "account", "faq"]

# Exclusion patterns - prevent wrong routing
EXCLUSIONS: Dict[str, List[str]] = {
    "ticket": ["ticketmaster", "ticket master"],  # Don't match "ticket" in "ticketmaster"
}

# Keyword-based routing (checked in order!)
KEYWORD_ROUTES: List[tuple[str, AgentType]] = [
    # FAQ keywords (general questions) - check first!
    ("what is fanfirst", "faq"),
    ("how does fanfirst", "faq"),
    ("ticketmaster", "faq"),
    ("difference", "faq"),
    ("compare", "faq"),
    ("vs", "faq"),
    ("safe", "faq"),
    ("security", "faq"),
    ("privacy", "faq"),
    ("blockchain", "faq"),
    ("nft ticket", "faq"),
    ("explain", "faq"),
    
    # Ticket keywords
    ("refund", "ticket"),
    ("cancel", "ticket"),
    ("transfer", "ticket"),
    ("qr code", "ticket"),
    ("qr", "ticket"),
    ("resale", "ticket"),
    ("resell", "ticket"),
    ("buy ticket", "ticket"),
    ("purchase", "ticket"),
    ("my ticket", "ticket"),
    
    # Event keywords
    ("lakers", "event"),
    ("taylor swift", "event"),
    ("drake", "event"),
    ("concert", "event"),
    ("event", "event"),
    ("show", "event"),
    ("when is", "event"),
    ("upcoming", "event"),
    
    # Account keywords
    ("wallet", "account"),
    ("connect", "account"),
    ("profile", "account"),
    ("fandom score", "account"),
    ("score", "account"),
    ("spotify", "account"),
    ("login", "account"),
    ("sign in", "account"),
]


class RouterAgent:
    """Routes queries - smart keyword matching with LLM fallback"""
    
    def __init__(self):
        self._llm = None
    
    @property
    def llm(self):
        if self._llm is None:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                try:
                    self._llm = ChatGoogleGenerativeAI(
                        model="gemini-1.5-flash",
                        google_api_key=api_key,
                        temperature=0.1,
                    )
                except Exception as e:
                    print(f"[Router] LLM init failed: {e}")
        return self._llm
    
    def _keyword_classify(self, message: str) -> AgentType | None:
        """Smart keyword matching with exclusions"""
        msg_lower = message.lower()
        
        # Check keywords in order
        for keyword, agent_type in KEYWORD_ROUTES:
            if keyword in msg_lower:
                # Check exclusions
                exclusions = EXCLUSIONS.get(agent_type, [])
                excluded = any(excl in msg_lower for excl in exclusions)
                
                if not excluded:
                    return agent_type
        
        return None
    
    async def classify(self, message: str) -> Tuple[AgentType, str]:
        """Classify with keyword routing first, LLM fallback"""
        
        # Try keyword routing (instant)
        keyword_result = self._keyword_classify(message)
        if keyword_result:
            return keyword_result, f"[Fast] → {self.get_agent_description(keyword_result)}"
        
        # LLM fallback for ambiguous queries
        if self.llm:
            try:
                prompt = f"""Classify this query for FanFirst support.
Reply with ONLY one word: ticket, event, account, or faq

Query: {message}

Answer:"""
                
                response = await self.llm.ainvoke([HumanMessage(content=prompt)])
                result = response.content.strip().lower()
                
                if "ticket" in result:
                    return "ticket", "Routing to Ticket Support"
                elif "event" in result:
                    return "event", "Routing to Event Info"
                elif "account" in result:
                    return "account", "Routing to Account Help"
                else:
                    return "faq", "Routing to FAQ"
                    
            except Exception as e:
                print(f"[Router] LLM error: {e}")
        
        # Default to FAQ
        return "faq", "Routing to FAQ"
    
    def get_agent_description(self, agent_type: AgentType) -> str:
        descriptions = {
            "ticket": "🎫 Ticket Support",
            "event": "🎵 Event Info",
            "account": "👤 Account Help",
            "faq": "❓ FAQ"
        }
        return descriptions.get(agent_type, "Support")
