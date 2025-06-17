from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import re
from uuid import UUID

from models.database import (
    Task, Idea, ChaosMetric, ChaosLevel, 
    TaskStatus, IdeaStatus
)
from core.config import settings

class ChaosDetectionService:
    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user_id = user_id
        self.now = datetime.utcnow()
        self.window_start = self.now - timedelta(seconds=settings.RAPID_CAPTURE_WINDOW)
        
        # Urgency keywords for detection
        self.urgency_keywords = [
            'urgent', 'asap', 'immediately', 'need to', 'should', 'must',
            'critical', 'important', 'deadline', 'rush', 'quick', 'fast'
        ]

    async def get_current_chaos_level(self) -> Dict:
        """Analyze current patterns and return chaos level with context"""
        
        # Get recent activity metrics
        metrics = await self._calculate_metrics()
        
        # Determine chaos level
        chaos_level = await self._determine_chaos_level(metrics)
        
        # Generate appropriate message
        message = await self._generate_chaos_message(chaos_level, metrics)
        
        # Store the metric record
        chaos_metric = ChaosMetric(
            user_id=self.user_id,
            chaos_level=chaos_level,
            capture_velocity=metrics['capture_velocity'],
            task_switches=metrics['task_switches'],
            urgency_keywords=metrics['urgency_keywords'],
            completion_ratio=metrics['completion_ratio'],
            detection_reason=message
        )
        self.db.add(chaos_metric)
        self.db.commit()
        
        return {
            'level': chaos_level,
            'message': message,
            'metrics': metrics,
            'intervention_suggested': chaos_level in [ChaosLevel.SCATTERED, ChaosLevel.SPINNING]
        }

    async def check_idea_capture_pattern(self) -> Optional[Dict]:
        """Check if rapid idea capture suggests chaos"""
        recent_ideas = self.db.query(Idea).filter(
            and_(
                Idea.user_id == self.user_id,
                Idea.created_at >= self.window_start
            )
        ).count()
        
        if recent_ideas >= settings.RAPID_CAPTURE_THRESHOLD:
            return {
                'trigger': 'rapid_capture',
                'message': f"You've captured {recent_ideas} ideas in 10 minutes. Want to take a moment to organize them?",
                'action': 'suggest_triage'
            }
        return None

    async def check_task_switching_pattern(self) -> Optional[Dict]:
        """Check for rapid task status changes"""
        # Count task updates in the last 10 minutes
        recent_updates = self.db.query(Task).filter(
            and_(
                Task.user_id == self.user_id,
                Task.updated_at >= self.window_start
            )
        ).count()
        
        if recent_updates >= 5:  # 5+ task changes in 10 minutes
            return {
                'trigger': 'task_switching',
                'message': "Lots of task switching happening. Need help focusing on one thing?",
                'action': 'suggest_focus'
            }
        return None

    async def check_task_creation_pattern(self) -> Optional[Dict]:
        """Check if new task creation suggests chaos"""
        recent_tasks = self.db.query(Task).filter(
            and_(
                Task.user_id == self.user_id,
                Task.created_at >= self.window_start
            )
        ).count()
        
        if recent_tasks >= 3:  # 3+ new tasks in 10 minutes
            return {
                'trigger': 'rapid_task_creation',
                'message': "You're creating a lot of tasks quickly. Is this avoiding your current MIT?",
                'action': 'check_current_focus'
            }
        return None

    async def _calculate_metrics(self) -> Dict:
        """Calculate all chaos detection metrics"""
        
        # Capture velocity (ideas + tasks in window)
        recent_ideas = self.db.query(Idea).filter(
            and_(Idea.user_id == self.user_id, Idea.created_at >= self.window_start)
        ).count()
        
        recent_tasks = self.db.query(Task).filter(
            and_(Task.user_id == self.user_id, Task.created_at >= self.window_start)
        ).count()
        
        capture_velocity = recent_ideas + recent_tasks
        
        # Task switching (updates in window)
        task_switches = self.db.query(Task).filter(
            and_(Task.user_id == self.user_id, Task.updated_at >= self.window_start)
        ).count()
        
        # Urgency keyword analysis
        urgency_count = await self._count_urgency_keywords()
        
        # Completion ratio (today's completed vs started)
        today_start = self.now.replace(hour=0, minute=0, second=0, microsecond=0)
        completed_today = self.db.query(Task).filter(
            and_(
                Task.user_id == self.user_id,
                Task