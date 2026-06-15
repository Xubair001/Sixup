"""
Auto-generate SVG avatars for users and teams.
Saved as static files so every entity has a real URL from creation.
Only called once at creation — update_avatar / logo upload replaces the URL.
"""
from __future__ import annotations

import os
import re

from app.config import settings

# 10 gradient pairs — assigned deterministically from the name's first char
_GRADIENTS = [
    ("#6366f1", "#a855f7"),  # indigo → purple
    ("#a855f7", "#3b82f6"),  # purple → blue
    ("#3b82f6", "#06b6d4"),  # blue → cyan
    ("#06b6d4", "#6366f1"),  # cyan → indigo
    ("#ec4899", "#a855f7"),  # pink → purple
    ("#f59e0b", "#ef4444"),  # amber → red
    ("#10b981", "#06b6d4"),  # emerald → cyan
    ("#ef4444", "#f97316"),  # red → orange
    ("#8b5cf6", "#06b6d4"),  # violet → cyan
    ("#f97316", "#eab308"),  # orange → yellow
]


def _initials(name: str) -> str:
    parts = re.split(r"[\s_\-]+", name.strip())
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return name[:2].upper() if len(name) >= 2 else name[0].upper()


def _gradient(name: str) -> tuple[str, str]:
    idx = sum(ord(c) for c in name) % len(_GRADIENTS)
    return _GRADIENTS[idx]


def _svg(initials: str, color1: str, color2: str, grad_id: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">'
        f'<defs>'
        f'<linearGradient id="{grad_id}" x1="0%" y1="0%" x2="100%" y2="100%">'
        f'<stop offset="0%" stop-color="{color1}"/>'
        f'<stop offset="100%" stop-color="{color2}"/>'
        f'</linearGradient>'
        f'</defs>'
        f'<circle cx="50" cy="50" r="50" fill="url(#{grad_id})"/>'
        f'<text x="50" y="50" dominant-baseline="central" text-anchor="middle" '
        f'font-family="system-ui,sans-serif" font-size="38" font-weight="700" fill="white">'
        f'{initials}'
        f'</text>'
        f'</svg>'
    )


def generate_user_avatar(public_id: str, display_name: str) -> str:
    """Generate and save a user avatar SVG. Returns the /static/… URL."""
    avatars_dir = os.path.join(settings.STATIC_DIR, "avatars")
    os.makedirs(avatars_dir, exist_ok=True)

    initials = _initials(display_name)
    c1, c2 = _gradient(display_name)
    filename = f"{public_id}.svg"
    path = os.path.join(avatars_dir, filename)

    with open(path, "w") as fh:
        fh.write(_svg(initials, c1, c2, f"g{public_id}"))

    return f"/static/avatars/{filename}"


def generate_team_logo(slug: str, name: str) -> str:
    """Generate and save a team logo SVG. Returns the /static/… URL."""
    logos_dir = os.path.join(settings.STATIC_DIR, "team-logos")
    os.makedirs(logos_dir, exist_ok=True)

    initials = _initials(name)
    c1, c2 = _gradient(name)
    filename = f"{slug}.svg"
    path = os.path.join(logos_dir, filename)

    with open(path, "w") as fh:
        fh.write(_svg(initials, c1, c2, f"g{slug}"))

    return f"/static/team-logos/{filename}"
