from fastapi import APIRouter

from pydantic import BaseModel

from app.services.gemini_service import (
    ask_eyebot
)

router = APIRouter()


class ChatRequest(BaseModel):

    message: str


@router.post("/chat")

def chatbot(request: ChatRequest):

    reply = ask_eyebot(
        request.message
    )

    return {

        "reply": reply
    }