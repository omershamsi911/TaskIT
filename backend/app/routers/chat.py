from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_active_user
from app.core.database import get_db
from app.services.chat_service import ChatService

router = APIRouter()

@router.get("/rooms")
async def get_chat_rooms(current_user = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    service = ChatService(db)
    return await service.get_user_chats(current_user.id)

@router.get("/rooms/{room_id}/messages")
async def get_messages(room_id: int, limit: int = 50, current_user = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    service = ChatService(db)
    return await service.get_messages(room_id, current_user.id, limit)

# WebSocket endpoint for real-time chat
@router.websocket("/ws/{room_id}")
async def websocket_chat(websocket: WebSocket, room_id: int, token: str):
    # Authenticate token, handle connection
    pass  # Implementation with ConnectionManager