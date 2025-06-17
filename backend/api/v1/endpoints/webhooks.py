# backend/api/v1/endpoints/webhooks.py

from fastapi import APIRouter, Request, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import hmac
import hashlib
import json
import logging
from datetime import datetime

from core.config import get_settings
from core.database import get_db

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
settings = get_settings()
logger = logging.getLogger(__name__)

@router.post("/whoop")
async def whoop_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle WHOOP webhook notifications"""
    
    try:
        # Get raw body and headers
        body = await request.body()
        signature = request.headers.get("whoop-signature")
        
        # Verify webhook signature (if WHOOP provides one)
        if signature and settings.WHOOP_CLIENT_SECRET:
            if not verify_whoop_signature(body, signature, settings.WHOOP_CLIENT_SECRET):
                raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Parse webhook payload
        try:
            payload = json.loads(body.decode())
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
        # Log webhook received
        logger.info(f"WHOOP webhook received: {payload.get('type', 'unknown')}")
        
        # Process webhook in background
        background_tasks.add_task(process_whoop_webhook, payload, db)
        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"WHOOP webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

def verify_whoop_signature(body: bytes, signature: str, secret: str) -> bool:
    """Verify WHOOP webhook signature"""
    try:
        # WHOOP signature format may vary - this is a generic HMAC verification
        expected_signature = hmac.new(
            secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        # Remove any prefix like "sha256="
        signature_value = signature.split("=")[-1] if "=" in signature else signature
        
        return hmac.compare_digest(expected_signature, signature_value)
    except Exception:
        return False

async def process_whoop_webhook(payload: dict, db: Session):
    """Process WHOOP webhook data in background"""
    
    try:
        webhook_type = payload.get("type")
        user_id = payload.get("user_id")
        data = payload.get("data", {})
        
        logger.info(f"Processing WHOOP webhook: {webhook_type} for user {user_id}")
        
        if webhook_type == "recovery.updated":
            await process_recovery_update(user_id, data, db)
        elif webhook_type == "sleep.updated":
            await process_sleep_update(user_id, data, db)
        elif webhook_type == "workout.updated":
            await process_workout_update(user_id, data, db)
        elif webhook_type == "cycle.updated":
            await process_cycle_update(user_id, data, db)
        else:
            logger.warning(f"Unknown WHOOP webhook type: {webhook_type}")
            
    except Exception as e:
        logger.error(f"Error processing WHOOP webhook: {str(e)}")

async def process_recovery_update(user_id: str, data: dict, db: Session):
    """Process recovery data update"""
    try:
        recovery_score = data.get("recovery_score")
        hrv_rmssd = data.get("hrv_rmssd")
        resting_heart_rate = data.get("resting_heart_rate")
        
        # TODO: Store in database
        logger.info(f"Recovery update for {user_id}: score={recovery_score}, hrv={hrv_rmssd}")
        
        # TODO: Update real-time dashboard if user is online
        
    except Exception as e:
        logger.error(f"Error processing recovery update: {str(e)}")

async def process_sleep_update(user_id: str, data: dict, db: Session):
    """Process sleep data update"""
    try:
        sleep_duration = data.get("sleep_duration_ms", 0) / (1000 * 60 * 60)  # Convert to hours
        sleep_efficiency = data.get("sleep_efficiency")
        
        # TODO: Store in database
        logger.info(f"Sleep update for {user_id}: duration={sleep_duration}h, efficiency={sleep_efficiency}")
        
    except Exception as e:
        logger.error(f"Error processing sleep update: {str(e)}")

async def process_workout_update(user_id: str, data: dict, db: Session):
    """Process workout data update"""
    try:
        strain_score = data.get("strain_score")
        duration = data.get("duration_ms", 0) / (1000 * 60)  # Convert to minutes
        
        # TODO: Store in database
        logger.info(f"Workout update for {user_id}: strain={strain_score}, duration={duration}min")
        
    except Exception as e:
        logger.error(f"Error processing workout update: {str(e)}")

async def process_cycle_update(user_id: str, data: dict, db: Session):
    """Process physiological cycle update"""
    try:
        cycle_id = data.get("cycle_id")
        
        # TODO: Store in database
        logger.info(f"Cycle update for {user_id}: cycle_id={cycle_id}")
        
    except Exception as e:
        logger.error(f"Error processing cycle update: {str(e)}")