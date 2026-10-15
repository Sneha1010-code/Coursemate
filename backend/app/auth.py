from fastapi import Header, HTTPException

from .supabase_client import supabase


async def get_current_user(authorization: str | None = Header(default=None)):
    """Validate the Supabase access token sent by the frontend and return the user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = response.user if response else None
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user
