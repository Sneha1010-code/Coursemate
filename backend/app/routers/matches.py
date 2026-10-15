from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..schemas import MatchOut
from ..supabase_client import supabase

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("", response_model=list[MatchOut])
async def browse_matches(user=Depends(get_current_user)):
    me_result = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not me_result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    me = me_result.data[0]

    if not (me.get("university") and me.get("course") and me.get("tutorial_group")):
        raise HTTPException(status_code=400, detail="Complete your course details first")

    # Case-insensitive, whitespace-trimmed match: two students who both typed
    # "Tutorial 3, Wednesday" shouldn't fail to match just because one typed
    # "tutorial 3, wednesday".
    others_result = (
        supabase.table("profiles")
        .select("*")
        .ilike("university", me["university"].strip())
        .ilike("course", me["course"].strip())
        .ilike("tutorial_group", me["tutorial_group"].strip())
        .neq("id", user.id)
        .execute()
    )
    others = others_result.data or []
    if not others:
        return []

    other_ids = [o["id"] for o in others]

    sent = (
        supabase.table("connections")
        .select("*")
        .eq("requester_id", user.id)
        .in_("recipient_id", other_ids)
        .execute()
    ).data or []
    received = (
        supabase.table("connections")
        .select("*")
        .eq("recipient_id", user.id)
        .in_("requester_id", other_ids)
        .execute()
    ).data or []

    status_by_other_id: dict[str, str] = {}
    for c in sent:
        status_by_other_id[c["recipient_id"]] = c["status"]
    for c in received:
        # if both exist (shouldn't normally), prefer the more advanced status
        status_by_other_id.setdefault(c["requester_id"], c["status"])

    return [
        MatchOut(
            id=o["id"],
            username=o["username"],
            course=o.get("course"),
            tutorial_group=o.get("tutorial_group"),
            interests=o.get("interests"),
            bio=o.get("bio"),
            looking_for=o.get("looking_for") or [],
            connection_status=status_by_other_id.get(o["id"]),
        )
        for o in others
    ]
