from typing import Literal, Optional

from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    username: str = Field(min_length=1, max_length=50)


class CourseDetailsUpdate(BaseModel):
    university: str = Field(min_length=1, max_length=120)
    course: str = Field(min_length=1, max_length=120)
    tutorial_group: str = Field(min_length=1, max_length=120)


class ProfileSetupUpdate(BaseModel):
    interests: str = Field(default="", max_length=300)
    bio: str = Field(default="", max_length=500)
    looking_for: list[str] = Field(default_factory=list)


class ProfileOut(BaseModel):
    id: str
    username: str
    university: Optional[str] = None
    course: Optional[str] = None
    tutorial_group: Optional[str] = None
    interests: Optional[str] = None
    bio: Optional[str] = None
    looking_for: list[str] = Field(default_factory=list)
    onboarding_complete: bool = False


class MatchOut(BaseModel):
    id: str
    username: str
    course: Optional[str] = None
    tutorial_group: Optional[str] = None
    interests: Optional[str] = None
    bio: Optional[str] = None
    looking_for: list[str] = Field(default_factory=list)
    connection_status: Optional[Literal["pending", "accepted", "declined"]] = None


class ConnectionCreate(BaseModel):
    recipient_id: str


class ConnectionOut(BaseModel):
    id: str
    requester_id: str
    recipient_id: str
    status: Literal["pending", "accepted", "declined"]
    other_username: str
    direction: Literal["sent", "received"]
