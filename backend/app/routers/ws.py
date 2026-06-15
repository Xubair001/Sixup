"""WebSocket router — live match score updates."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.websockets.manager import ConnectionManager, get_manager

router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/matches/{match_id}")
async def match_live(
    match_id: int,
    ws: WebSocket,
    manager: Annotated[ConnectionManager, Depends(get_manager)],
) -> None:
    await manager.connect(match_id, ws)
    try:
        while True:
            # Keep connection alive; clients only receive, don't send
            await ws.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(match_id, ws)
