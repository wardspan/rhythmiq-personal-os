# backend/api/v1/endpoints/whoop.py

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import RedirectResponse
import httpx
import secrets
from datetime import datetime, timedelta
from typing import Optional
import logging

from core.config import get_settings
from core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/whoop", tags=["whoop"])
settings = get_settings()
logger = logging.getLogger(__name__)

# In-memory store for OAuth states (use Redis in production)
oauth_states = {}

@router.get("/connect")
async def initiate_whoop_oauth():
    """Start WHOOP OAuth flow"""
    if not settings.WHOOP_CLIENT_ID:
        raise HTTPException(status_code=500, detail="WHOOP integration not configured")
    
    # Generate secure state parameter
    state = secrets.token_urlsafe(32)
    oauth_states[state] = {
        "created_at": datetime.utcnow(),
        "used": False
    }
    
    # Build WHOOP OAuth URL
    auth_url = (
        f"{settings.WHOOP_BASE_URL}/oauth/authorize"
        f"?response_type=code"
        f"&client_id={settings.WHOOP_CLIENT_ID}"
        f"&redirect_uri={settings.WHOOP_REDIRECT_URI}"
        f"&scope={settings.WHOOP_SCOPE}"
        f"&state={state}"
    )
    
    return {"auth_url": auth_url, "state": state}

@router.get("/callback")
async def whoop_oauth_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Handle WHOOP OAuth callback"""
    
    # Verify state parameter
    if state not in oauth_states or oauth_states[state]["used"]:
        raise HTTPException(status_code=400, detail="Invalid or expired state parameter")
    
    # Mark state as used
    oauth_states[state]["used"] = True
    
    try:
        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                f"{settings.WHOOP_BASE_URL}/oauth/token",
                data={
                    "grant_type": "authorization_code",
                    "client_id": settings.WHOOP_CLIENT_ID,
                    "client_secret": settings.WHOOP_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.WHOOP_REDIRECT_URI
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if token_response.status_code != 200:
                logger.error(f"WHOOP token exchange failed: {token_response.text}")
                raise HTTPException(status_code=400, detail="Failed to exchange code for tokens")
            
            tokens = token_response.json()
            
            # Get user profile to store user mapping
            user_response = await client.get(
                f"{settings.WHOOP_BASE_URL}/developer/v1/user/profile/basic",
                headers={"Authorization": f"Bearer {tokens['access_token']}"}
            )
            
            if user_response.status_code != 200:
                logger.error(f"WHOOP profile fetch failed: {user_response.text}")
                raise HTTPException(status_code=400, detail="Failed to fetch user profile")
            
            user_profile = user_response.json()
            
            # Store tokens in database (you'll need to create this table)
            # For now, we'll just log success
            logger.info(f"WHOOP connected for user {user_profile.get('user_id')}")
            
            # Schedule background task to fetch initial data
            background_tasks.add_task(fetch_initial_whoop_data, tokens['access_token'])
            
            # Redirect to frontend with success
            return RedirectResponse(url="http://localhost:3000/?whoop=connected")
    
    except Exception as e:
        logger.error(f"WHOOP OAuth callback error: {str(e)}")
        return RedirectResponse(url="http://localhost:3000/?whoop=error")

@router.post("/disconnect")
async def disconnect_whoop(db: Session = Depends(get_db)):
    """Disconnect WHOOP integration"""
    # TODO: Remove tokens from database
    # TODO: Revoke tokens with WHOOP if possible
    return {"message": "WHOOP disconnected successfully"}

@router.get("/status")
async def whoop_status(db: Session = Depends(get_db)):
    """Check WHOOP connection status"""
    # TODO: Check if user has valid WHOOP tokens
    # For now, return mock status
    return {
        "connected": False,
        "last_sync": None,
        "enabled": bool(settings.WHOOP_CLIENT_ID and settings.WHOOP_CLIENT_SECRET)
    }

@router.get("/health")
async def get_health_data(db: Session = Depends(get_db)):
    """Get latest health data from WHOOP"""
    # TODO: Fetch from database or WHOOP API
    # For now, return mock data
    return {
        "recovery_score": 78,
        "sleep_duration": 7.2,
        "sleep_quality": 85,
        "energy_level": 7,
        "hrv_score": 82,
        "readiness_score": 80,
        "last_updated": datetime.utcnow().isoformat(),
        "whoop_connected": False
    }

async def fetch_initial_whoop_data(access_token: str):
    """Background task to fetch initial WHOOP data"""
    try:
        async with httpx.AsyncClient() as client:
            # Fetch recovery data
            recovery_response = await client.get(
                f"{settings.WHOOP_BASE_URL}/developer/v1/recovery",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"limit": 7}  # Last 7 days
            )
            
            if recovery_response.status_code == 200:
                recovery_data = recovery_response.json()
                logger.info(f"Fetched {len(recovery_data.get('records', []))} recovery records")
                # TODO: Store in database
            
            # Fetch sleep data
            sleep_response = await client.get(
                f"{settings.WHOOP_BASE_URL}/developer/v1/activity/sleep",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"limit": 7}
            )
            
            if sleep_response.status_code == 200:
                sleep_data = sleep_response.json()
                logger.info(f"Fetched {len(sleep_data.get('records', []))} sleep records")
                # TODO: Store in database
                
    except Exception as e:
        logger.error(f"Failed to fetch initial WHOOP data: {str(e)}")

# Cleanup old OAuth states periodically
@router.on_event("startup")
async def cleanup_oauth_states():
    """Clean up expired OAuth states"""
    current_time = datetime.utcnow()
    expired_states = [
        state for state, data in oauth_states.items()
        if current_time - data["created_at"] > timedelta(minutes=10)
    ]
    for state in expired_states:
        del oauth_states[state]