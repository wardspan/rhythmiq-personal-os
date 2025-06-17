# backend/api/v1/endpoints/tasks.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db

router = APIRouter()

@router.get("/")
async def get_tasks():
    """Get all tasks - simplified for now"""
    return {
        "tasks": [
            {"id": "1", "title": "Set up Rhythmiq", "status": "doing", "is_mit": True},
            {"id": "2", "title": "Test chaos detection", "status": "not_started", "is_mit": True},
            {"id": "3", "title": "Connect AI routing", "status": "not_started", "is_mit": True}
        ]
    }

@router.get("/mits")
async def get_mits():
    """Get Most Important Tasks"""
    return {
        "mits": [
            {"title": "Set up Rhythmiq", "status": "doing"},
            {"title": "Test chaos detection", "status": "not_started"},
            {"title": "Connect AI routing", "status": "not_started"}
        ]
    }

@router.post("/")
async def create_task(task_data: dict):
    """Create a new task - simplified"""
    return {
        "message": "Task created",
        "task": task_data
    }