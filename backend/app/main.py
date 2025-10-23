from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, alerts, ai  # Add ai import
from app.db.base import Base, engine
from app.core.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crypto-Sentry AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])  # Add AI router

@app.get("/")
def read_root():
    return {"message": "Welcome to the Crypto-Sentry AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Crypto-Sentry AI API"}
