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

# Include weather router - CHECK THIS SECTION
try:
    from api.v1.endpoints.weather import router as weather_router
    api_router.include_router(weather_router, tags=["weather"])  # IMPORTANT: No prefix here!
    print("✅ Weather router registered successfully")
except ImportError as e:
    print(f"❌ Weather endpoint import failed: {e}")
    # Weather endpoint not ready yet
    pass

try:
    from api.v1.endpoints.health import router as health_router
    api_router.include_router(health_router, prefix="/health", tags=["health"])
except ImportError:
    # Health endpoint not ready yet
    pass

try:
    from api.v1.endpoints.whoop import router as whoop_router
    api_router.include_router(whoop_router, prefix="/whoop", tags=["whoop"])
except ImportError:
    # WHOOP endpoint not ready yet
    pass

# Webhooks (no prefix - webhooks need to be at root level)
try:
    from api.v1.endpoints.webhooks import router as webhooks_router
    api_router.include_router(webhooks_router, tags=["webhooks"])
except ImportError:
    # Webhooks endpoint not ready yet
    pass

# TODO: Include other endpoint routers when they're created
# api_router.include_router(ideas.router, prefix="/ideas", tags=["ideas"])
# api_router.include_router(journal.router, prefix="/journal", tags=["journal"])
# api_router.include_router(ai_chat.router, prefix="/ai", tags=["ai"])
# api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
# api_router.include_router(chaos.router, prefix="/chaos", tags=["chaos-detection"])