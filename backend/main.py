from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Import database components
from core.database import engine, Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Rhythmiq API...")
    try:
        # Import all models so they're registered with Base
        from models.database import (
            User, Task, Idea, JournalEntry, 
            AIConversation, ChaosMetric
        )
        
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # Continue anyway for development
    
    yield
    # Shutdown
    logger.info("Shutting down Rhythmiq API...")

app = FastAPI(
    title="Rhythmiq API",
    description="Personal OS for ADHD-friendly productivity and cognitive management",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
from api.v1.api import api_router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Rhythmiq Personal OS API",
        "version": "1.0.0",
        "status": "running",
        "frontend": "http://localhost:3000",
        "docs": "http://localhost:8000/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)