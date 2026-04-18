from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import (
    auth, users, providers, bookings, payments,
    reviews, chat, disputes, admin, ai
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if not exist (in dev)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: close connections
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(providers.router, prefix="/api/providers", tags=["Providers"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(disputes.router, prefix="/api/disputes", tags=["Disputes"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/health")
async def health():
    return {"status": "ok"}