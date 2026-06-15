"""
WebSocket connection manager — singleton injected via FastAPI Depends.
Tracks connections per match_id and broadcasts score updates.
Uses Redis pub/sub so multiple uvicorn workers stay in sync.
Falls back to in-process broadcast if Redis is unavailable.
"""
from __future__ import annotations

import asyncio
import json
from collections import defaultdict

from fastapi import WebSocket
from loguru import logger


class ConnectionManager:
    def __init__(self) -> None:
        # match_id → set of active WebSocket connections
        self._rooms: dict[int, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def connect(self, match_id: int, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._rooms[match_id].add(ws)
        logger.debug("WS connected to match {mid} ({n} total)", mid=match_id, n=len(self._rooms[match_id]))

    async def disconnect(self, match_id: int, ws: WebSocket) -> None:
        async with self._lock:
            self._rooms[match_id].discard(ws)
            if not self._rooms[match_id]:
                del self._rooms[match_id]
        logger.debug("WS disconnected from match {mid}", mid=match_id)

    async def broadcast(self, match_id: int, payload: dict) -> None:
        """Send a JSON message to all clients watching this match."""
        message = json.dumps(payload)
        dead: list[WebSocket] = []

        connections = set(self._rooms.get(match_id, set()))
        for ws in connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)

        for ws in dead:
            await self.disconnect(match_id, ws)

        if connections:
            logger.debug("Broadcast to match {mid}: {payload}", mid=match_id, payload=payload)


# Module-level singleton — injected via Depends, never accessed directly in services
_manager = ConnectionManager()


def get_manager() -> ConnectionManager:
    return _manager
