from fastapi import APIRouter

# Create the main API router
api_router = APIRouter()

# Add basic endpoints
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Rhythmiq API is running"}

@api_router.get("/")
async def api_root():
    return {
        "message": "Rhythmiq API v1", 
        "endpoints": ["/health", "/tasks", "/docs", "/redoc"]
    }

# Include tasks router
try:
    from api.v1.endpoints.tasks import router as tasks_router
    api_router.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
except ImportError:
    # Tasks endpoint not ready yet
    pass

# TODO: Include other endpoint routers when they're created
# api_router.include_router(ideas.router, prefix="/ideas", tags=["ideas"])
# api_router.include_router(journal.router, prefix="/journal", tags=["journal"])
# api_router.include_router(ai_chat.router, prefix="/ai", tags=["ai"])
# api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
# api_router.include_router(chaos.router, prefix="/chaos", tags=["chaos-detection"])