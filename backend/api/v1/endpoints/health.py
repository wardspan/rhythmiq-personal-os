# backend/api/v1/endpoints/health.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import redis
import httpx
import os
from core.database import get_db
from core.config import settings
import time

router = APIRouter()

@router.get("/")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

@router.get("/database")
async def health_check_database(db: Session = Depends(get_db)):
    """Check database connectivity"""
    start_time = time.time()
    try:
        # Simple query to test database connectivity
        result = db.execute(text("SELECT 1"))
        result.fetchone()
        response_time = round((time.time() - start_time) * 1000, 2)
        
        return {
            "status": "connected",
            "response_time_ms": response_time,
            "database_type": "postgresql"
        }
    except Exception as e:
        response_time = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "error",
            "response_time_ms": response_time,
            "error": str(e)
        }

@router.get("/redis")
async def health_check_redis():
    """Check Redis connectivity"""
    start_time = time.time()
    try:
        # Connect to Redis using the same URL as the app
        redis_client = redis.from_url(settings.REDIS_URL)
        redis_client.ping()
        response_time = round((time.time() - start_time) * 1000, 2)
        
        return {
            "status": "connected",
            "response_time_ms": response_time,
            "redis_url": settings.REDIS_URL
        }
    except Exception as e:
        response_time = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "error", 
            "response_time_ms": response_time,
            "error": str(e)
        }

@router.get("/openai")
async def health_check_openai():
    """Check OpenAI API key configuration"""
    try:
        has_key = bool(settings.OPENAI_API_KEY)
        if has_key:
            # Could add actual API test here if needed
            return {
                "status": "connected",
                "enabled": True,
                "configured": True
            }
        else:
            return {
                "status": "disabled",
                "enabled": False,
                "configured": False,
                "message": "API key not configured"
            }
    except Exception as e:
        return {
            "status": "error",
            "enabled": False,
            "error": str(e)
        }

@router.get("/anthropic") 
async def health_check_anthropic():
    """Check Anthropic API key configuration"""
    try:
        has_key = bool(settings.ANTHROPIC_API_KEY)
        if has_key:
            return {
                "status": "connected",
                "enabled": True,
                "configured": True
            }
        else:
            return {
                "status": "disabled", 
                "enabled": False,
                "configured": False,
                "message": "API key not configured"
            }
    except Exception as e:
        return {
            "status": "error",
            "enabled": False,
            "error": str(e)
        }

@router.get("/whoop")
async def health_check_whoop():
    """Check WHOOP API configuration (placeholder)"""
    try:
        # Placeholder for future WHOOP integration
        whoop_token = os.getenv("WHOOP_ACCESS_TOKEN")
        if whoop_token:
            return {
                "status": "connected",
                "enabled": True,
                "configured": True
            }
        else:
            return {
                "status": "disabled",
                "enabled": False, 
                "configured": False,
                "message": "WHOOP integration not configured"
            }
    except Exception as e:
        return {
            "status": "error",
            "enabled": False,
            "error": str(e)
        }

@router.get("/n8n")
async def health_check_n8n():
    """Check n8n connectivity"""
    start_time = time.time()
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://n8n:5678/healthz", timeout=5.0)
            response_time = round((time.time() - start_time) * 1000, 2)
            
            if response.status_code == 200:
                return {
                    "status": "connected",
                    "response_time_ms": response_time,
                    "n8n_url": "http://localhost:5678"
                }
            else:
                return {
                    "status": "error",
                    "response_time_ms": response_time,
                    "status_code": response.status_code
                }
    except Exception as e:
        response_time = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "disconnected",
            "response_time_ms": response_time,
            "error": str(e)
        }

@router.get("/whoop")
async def check_whoop_health():
    """Check WHOOP integration health"""
    
    # Check if WHOOP is configured
    if not settings.WHOOP_CLIENT_ID or not settings.WHOOP_CLIENT_SECRET:
        return {
            "status": "disabled",
            "enabled": False,
            "message": "WHOOP credentials not configured"
        }
    
    try:
        # Test WHOOP API connectivity
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{settings.WHOOP_BASE_URL}/")
            
        if response.status_code < 500:
            return {
                "status": "connected",
                "enabled": True,
                "message": "WHOOP API accessible"
            }
        else:
            return {
                "status": "error",
                "enabled": True,
                "message": "WHOOP API error"
            }
            
    except Exception as e:
        return {
            "status": "error",
            "enabled": True,
            "message": f"WHOOP API unreachable: {str(e)}"
        }

@router.get("/summary")
async def get_health_summary(db: Session = Depends(get_db)):
    """Get comprehensive health summary including WHOOP data"""
    
    # For now, return mock data
    # TODO: Fetch real data from database
    
    return {
        "recovery_score": 78,
        "sleep_duration": 7.2,
        "sleep_quality": 85,
        "energy_level": 7,
        "hrv_score": 82,
        "readiness_score": 80,
        "last_updated": "2025-06-17T15:30:00Z",
        "whoop_connected": False,
        "data_sources": {
            "whoop": False,
            "manual": True,
            "estimated": True
        }
    }
    
@router.get("/all")
async def health_check_all(db: Session = Depends(get_db)):
    """Comprehensive health check of all services"""
    start_time = time.time()
    
    # Run all health checks
    results = {
        "timestamp": time.time(),
        "overall_status": "unknown",
        "services": {}
    }
    
    # Core services
    try:
        api_health = await health_check()
        results["services"]["api"] = api_health
    except Exception as e:
        results["services"]["api"] = {"status": "error", "error": str(e)}
    
    try:
        db_health = await health_check_database(db)
        results["services"]["database"] = db_health
    except Exception as e:
        results["services"]["database"] = {"status": "error", "error": str(e)}
    
    try:
        redis_health = await health_check_redis()
        results["services"]["redis"] = redis_health
    except Exception as e:
        results["services"]["redis"] = {"status": "error", "error": str(e)}
    
    # External services
    try:
        n8n_health = await health_check_n8n()
        results["services"]["n8n"] = n8n_health
    except Exception as e:
        results["services"]["n8n"] = {"status": "error", "error": str(e)}
    
    try:
        openai_health = await health_check_openai()
        results["services"]["openai"] = openai_health
    except Exception as e:
        results["services"]["openai"] = {"status": "error", "error": str(e)}
    
    try:
        anthropic_health = await health_check_anthropic()
        results["services"]["anthropic"] = anthropic_health
    except Exception as e:
        results["services"]["anthropic"] = {"status": "error", "error": str(e)}
    
    try:
        whoop_health = await health_check_whoop()
        results["services"]["whoop"] = whoop_health
    except Exception as e:
        results["services"]["whoop"] = {"status": "error", "error": str(e)}
    
    # Determine overall status
    core_services = ["api", "database"]
    core_healthy = all(
        results["services"].get(service, {}).get("status") in ["healthy", "connected"]
        for service in core_services
    )
    
    if core_healthy:
        results["overall_status"] = "healthy"
    else:
        results["overall_status"] = "degraded"
    
    results["response_time_ms"] = round((time.time() - start_time) * 1000, 2)
    
    return results