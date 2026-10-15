from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..schemas import ConnectionCreate, ConnectionOut
from ..supabase_client import supabase

router = APIRouter(prefix="/connections", tags=["connections"])


def _username(user_id: str) -> str:
    result = supabase.table("profiles").select("username").eq("id", user_id).execute()
    return result.data[0]["username"] if result.data else "Unknown"


@router.post("", response_model=ConnectionOut, status_code=201)
async def send_connection_request(payload: ConnectionCreate, user=Depends(get_current_user)):
    if payload.recipient_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot connect with yourself")

    existing = (
        supabase.table("connections")
        .select("*")
        .or_(
            f"and(requester_id.eq.{user.id},recipient_id.eq.{payload.recipient_id}),"
            f"and(requester_id.eq.{payload.recipient_id},recipient_id.eq.{user.id})"
        )
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="A connection request already exists")

    result = (
        supabase.table("connections")
        .insert({"requester_id": user.id, "recipient_id": payload.recipient_id, "status": "pending"})
        .execute()
    )
    row = result.data[0]
    return ConnectionOut(
        id=row["id"],
        requester_id=row["requester_id"],
        recipient_id=row["recipient_id"],
        status=row["status"],
        other_username=_username(row["recipient_id"]),
        direction="sent",
    )


@router.get("", response_model=list[ConnectionOut])
async def list_connections(user=Depends(get_current_user)):
    sent = (
        supabase.table("connections").select("*").eq("requester_id", user.id).execute()
    ).data or []
    received = (
        supabase.table("connections").select("*").eq("recipient_id", user.id).execute()
    ).data or []

    out = []
    for row in sent:
        out.append(
            ConnectionOut(
                id=row["id"],
                requester_id=row["requester_id"],
                recipient_id=row["recipient_id"],
                status=row["status"],
                other_username=_username(row["recipient_id"]),
                direction="sent",
            )
        )
    for row in received:
        out.append(
            ConnectionOut(
                id=row["id"],
                requester_id=row["requester_id"],
                recipient_id=row["recipient_id"],
                status=row["status"],
                other_username=_username(row["requester_id"]),
                direction="received",
            )
        )
    return out


def _get_connection_or_404(connection_id: str) -> dict:
    result = supabase.table("connections").select("*").eq("id", connection_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Connection not found")
    return result.data[0]


@router.patch("/{connection_id}/accept", response_model=ConnectionOut)
async def accept_connection(connection_id: str, user=Depends(get_current_user)):
    row = _get_connection_or_404(connection_id)
    if row["recipient_id"] != user.id:
        raise HTTPException(status_code=403, detail="Only the recipient can accept this request")

    result = (
        supabase.table("connections")
        .update({"status": "accepted"})
        .eq("id", connection_id)
        .execute()
    )
    updated = result.data[0]
    return ConnectionOut(
        id=updated["id"],
        requester_id=updated["requester_id"],
        recipient_id=updated["recipient_id"],
        status=updated["status"],
        other_username=_username(updated["requester_id"]),
        direction="received",
    )


@router.patch("/{connection_id}/decline", response_model=ConnectionOut)
async def decline_connection(connection_id: str, user=Depends(get_current_user)):
    row = _get_connection_or_404(connection_id)
    if row["recipient_id"] != user.id:
        raise HTTPException(status_code=403, detail="Only the recipient can decline this request")

    result = (
        supabase.table("connections")
        .update({"status": "declined"})
        .eq("id", connection_id)
        .execute()
    )
    updated = result.data[0]
    return ConnectionOut(
        id=updated["id"],
        requester_id=updated["requester_id"],
        recipient_id=updated["recipient_id"],
        status=updated["status"],
        other_username=_username(updated["requester_id"]),
        direction="received",
    )


@router.delete("/{connection_id}", status_code=204)
async def cancel_connection(connection_id: str, user=Depends(get_current_user)):
    row = _get_connection_or_404(connection_id)
    if row["requester_id"] != user.id:
        raise HTTPException(status_code=403, detail="Only the requester can cancel this request")

    supabase.table("connections").delete().eq("id", connection_id).execute()
    return None
