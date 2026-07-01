from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.session import get_db, SessionLocal
from app.dependencies import get_current_user
from app.chatbot.ollama_client import call_ollama, check_ollama_health, stream_ollama
from app.users.extra_models import ChatHistory
from typing import Optional

router = APIRouter(prefix="/chat", tags=["Chatbot"])

SYSTEM_PROMPT = """You are an expert HR Assistant and Career Development Coach for an enterprise organization. 
You help employees and managers with:
- Performance improvement strategies
- Promotion roadmaps and career growth
- Skill development and training recommendations
- Stress management and work-life balance
- KPI improvement techniques
- Leadership development
- Conflict resolution and team dynamics

Be empathetic, practical, and data-driven. Provide actionable advice in 3-5 concise bullet points or a short paragraph. 
Always be encouraging and professional."""

FALLBACK_RESPONSES = {
    "performance": "To boost performance and move toward star status: 1) Set clear SMART goals with your manager, 2) Request regular feedback and act on it, 3) Focus on your top 3 KPIs daily, 4) Track progress weekly, 5) Take ownership of high-visibility results.",
    "promotion": "For a promotion / star-performer roadmap: 1) Clarify expectations for the next level with your manager, 2) Consistently exceed current role requirements, 3) Take on stretch and cross-functional projects, 4) Build strong stakeholder relationships, 5) Document and communicate your achievements.",
    "skill": "For skill development: 1) Identify your top 2-3 skill gaps, 2) Enroll in targeted courses (Coursera, LinkedIn Learning), 3) Earn a relevant certification, 4) Find a mentor in your domain, 5) Apply new skills on real projects.",
    "potential": "To raise potential: 1) Seek leadership opportunities (lead a project or mentor a peer), 2) Invest in continuous learning and certifications, 3) Build broad business understanding beyond your role, 4) Demonstrate initiative and strategic thinking, 5) Ask for visibility with senior leaders.",
    "wellbeing": "For stress and work-life balance: 1) Prioritize ruthlessly and protect focus time, 2) Set realistic boundaries on workload, 3) Take short regular breaks, 4) Communicate early when overloaded, 5) Use available wellbeing resources.",
    "default": "Great question! To grow in your career: focus on consistently delivering measurable results, closing your top skill gaps, seeking feedback, and taking on stretch assignments that increase your visibility. Tell me more about the specific area — performance, promotion, skills, leadership, or wellbeing — and I'll give targeted advice.",
}


class ChatRequest(BaseModel):
    message: str
    employee_context: Optional[dict] = None


@router.post("/chat")
def chat(data: ChatRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    message = (data.message or "").strip()
    if not message:
        return {"message": data.message, "response": _get_fallback(""), "ai_powered": False}

    ai_powered = False
    response = ""

    if check_ollama_health():
        context = f"\n\nEmployee Context: {data.employee_context}" if data.employee_context else ""
        response = call_ollama(f"{message}{context}", system=SYSTEM_PROMPT)
        ai_powered = bool(response)

    # Always guarantee a useful reply, even if the model is slow/unavailable.
    if not response:
        response = _get_fallback(message)

    # Store chat history (best-effort; never block the reply on a DB hiccup)
    try:
        db.add(ChatHistory(user_id=current_user.id, message=message, response=response))
        db.commit()
    except Exception:
        db.rollback()

    return {
        "message": message,
        "response": response,
        "ai_powered": ai_powered,
    }


@router.post("/stream")
def chat_stream(data: ChatRequest, current_user=Depends(get_current_user)):
    """Stream the assistant reply token-by-token for a responsive UX.

    Streaming matters because the local model can take tens of seconds to
    produce a full answer; sending tokens as they arrive keeps the chat alive
    instead of appearing frozen.
    """
    ollama_available = check_ollama_health()
    context = f"\n\nEmployee Context: {data.employee_context}" if data.employee_context else ""
    full_prompt = f"{data.message}{context}"
    user_id = current_user.id

    def generate():
        collected = []
        if ollama_available:
            for token in stream_ollama(full_prompt, system=SYSTEM_PROMPT):
                collected.append(token)
                yield token
        # Nothing produced (model offline, error, or empty) -> rule-based fallback.
        if not collected:
            fallback = _get_fallback(data.message)
            collected.append(fallback)
            yield fallback

        # Persist the completed exchange.
        try:
            db = SessionLocal()
            db.add(ChatHistory(user_id=user_id, message=data.message, response="".join(collected)))
            db.commit()
            db.close()
        except Exception:
            pass

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.timestamp.desc()).limit(50).all()
    return [{"message": h.message, "response": h.response, "timestamp": h.timestamp} for h in history]


def _get_fallback(message: str) -> str:
    msg_lower = (message or "").lower()
    if any(w in msg_lower for w in ["promotion", "promote", "career", "star", "next level", "advance", "leader role"]):
        return FALLBACK_RESPONSES["promotion"]
    if any(w in msg_lower for w in ["potential", "leadership", "lead ", "manage", "future"]):
        return FALLBACK_RESPONSES["potential"]
    if any(w in msg_lower for w in ["skill", "training", "learn", "course", "certif", "develop"]):
        return FALLBACK_RESPONSES["skill"]
    if any(w in msg_lower for w in ["stress", "balance", "burnout", "wellbeing", "well-being", "overwhelm"]):
        return FALLBACK_RESPONSES["wellbeing"]
    if any(w in msg_lower for w in ["performance", "perform", "kpi", "improve", "productivity", "goal", "target"]):
        return FALLBACK_RESPONSES["performance"]
    return FALLBACK_RESPONSES["default"]
