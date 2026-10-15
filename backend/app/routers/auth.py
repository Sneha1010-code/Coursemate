from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["auth"])


class SignUpRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    username: str = Field(min_length=1, max_length=50)


@router.post("/signup", status_code=201)
async def signup(payload: SignUpRequest):
    """Create the auth user and profile row in one step.

    Goes through the Supabase admin API (service role key, server-side only)
    instead of the public signUp() endpoint, so it isn't subject to the
    default Supabase project's very low shared-SMTP email rate limit, and
    doesn't require email confirmation. The frontend signs the user in
    immediately afterwards with their chosen password.
    """
    try:
        result = supabase.auth.admin.create_user(
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
            }
        )
    except Exception as exc:
        message = str(exc)
        if "already" in message.lower() or "duplicate" in message.lower():
            raise HTTPException(status_code=409, detail="An account with this email already exists")
        raise HTTPException(status_code=400, detail="Could not create account")

    user = result.user
    supabase.table("profiles").insert({"id": user.id, "username": payload.username}).execute()

    return {"status": "ok"}
