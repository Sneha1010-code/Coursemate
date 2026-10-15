import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .routers import auth, connections, matches, profiles  # noqa: E402

app = FastAPI(title="CourseMate API")

allowed_origins = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_URL", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(matches.router)
app.include_router(connections.router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "coursemate-api"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
