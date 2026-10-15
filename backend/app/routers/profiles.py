from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..schemas import CourseDetailsUpdate, ProfileCreate, ProfileOut, ProfileSetupUpdate
from ..supabase_client import supabase

router = APIRouter(prefix="/profiles", tags=["profiles"])


def _to_profile_out(row: dict) -> ProfileOut:
    return ProfileOut(
        id=row["id"],
        username=row["username"],
        university=row.get("university"),
        course=row.get("course"),
        tutorial_group=row.get("tutorial_group"),
        interests=row.get("interests"),
        bio=row.get("bio"),
        looking_for=row.get("looking_for") or [],
        onboarding_complete=bool(row.get("university") and row.get("course") and row.get("tutorial_group")),
    )


@router.post("/me", response_model=ProfileOut)
async def create_my_profile(payload: ProfileCreate, user=Depends(get_current_user)):
    existing = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if existing.data:
        return _to_profile_out(existing.data[0])

    result = (
        supabase.table("profiles")
        .insert({"id": user.id, "username": payload.username})
        .execute()
    )
    return _to_profile_out(result.data[0])


@router.get("/me", response_model=ProfileOut)
async def get_my_profile(user=Depends(get_current_user)):
    result = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _to_profile_out(result.data[0])


@router.put("/me/course", response_model=ProfileOut)
async def update_course_details(payload: CourseDetailsUpdate, user=Depends(get_current_user)):
    result = (
        supabase.table("profiles")
        .update(payload.model_dump())
        .eq("id", user.id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _to_profile_out(result.data[0])


@router.put("/me/setup", response_model=ProfileOut)
async def update_profile_setup(payload: ProfileSetupUpdate, user=Depends(get_current_user)):
    result = (
        supabase.table("profiles")
        .update(payload.model_dump())
        .eq("id", user.id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _to_profile_out(result.data[0])
