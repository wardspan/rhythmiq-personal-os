from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from typing import Dict, Optional
import re
from uuid import UUID

from models.database import Task, Idea, ChaosMetric, ChaosLevel
from core.config import settings


class ChaosDetectionService:
    """Service for analysing recent activity and determining a user's mental state."""

    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user_id = user_id
        self.now = datetime.utcnow()
        self.window_start = self.now - timedelta(seconds=settings.RAPID_CAPTURE_WINDOW)
        self.urgency_keywords = [
            "urgent",
            "asap",
            "immediately",
            "need to",
            "should",
            "must",
            "critical",
            "important",
            "deadline",
            "rush",
            "quick",
            "fast",
        ]

    async def get_current_chaos_level(self) -> Dict:
        metrics = await self._calculate_metrics()
        chaos_level = await self._determine_chaos_level(metrics)
        message = await self._generate_chaos_message(chaos_level, metrics)

        chaos_metric = ChaosMetric(
            user_id=self.user_id,
            chaos_level=chaos_level,
            capture_velocity=metrics["capture_velocity"],
            task_switches=metrics["task_switches"],
            urgency_keywords=metrics["urgency_keywords"],
            completion_ratio=metrics["completion_ratio"],
            detection_reason=message,
        )
        self.db.add(chaos_metric)
        self.db.commit()

        return {
            "level": chaos_level,
            "message": message,
            "metrics": metrics,
            "intervention_suggested": chaos_level in [
                ChaosLevel.SCATTERED,
                ChaosLevel.SPINNING,
            ],
        }

    async def check_idea_capture_pattern(self) -> Optional[Dict]:
        recent_ideas = (
            self.db.query(Idea)
            .filter(
                and_(Idea.user_id == self.user_id, Idea.created_at >= self.window_start)
            )
            .count()
        )
        if recent_ideas >= settings.RAPID_CAPTURE_THRESHOLD:
            return {
                "trigger": "rapid_capture",
                "message": f"You've captured {recent_ideas} ideas in 10 minutes. Want to take a moment to organize them?",
                "action": "suggest_triage",
            }
        return None

    async def check_task_switching_pattern(self) -> Optional[Dict]:
        recent_updates = (
            self.db.query(Task)
            .filter(
                and_(Task.user_id == self.user_id, Task.updated_at >= self.window_start)
            )
            .count()
        )
        if recent_updates >= 5:
            return {
                "trigger": "task_switching",
                "message": "Lots of task switching happening. Need help focusing on one thing?",
                "action": "suggest_focus",
            }
        return None

    async def check_task_creation_pattern(self) -> Optional[Dict]:
        recent_tasks = (
            self.db.query(Task)
            .filter(
                and_(Task.user_id == self.user_id, Task.created_at >= self.window_start)
            )
            .count()
        )
        if recent_tasks >= 3:
            return {
                "trigger": "rapid_task_creation",
                "message": "You're creating a lot of tasks quickly. Is this avoiding your current MIT?",
                "action": "check_current_focus",
            }
        return None

    async def _calculate_metrics(self) -> Dict:
        recent_ideas = (
            self.db.query(Idea)
            .filter(and_(Idea.user_id == self.user_id, Idea.created_at >= self.window_start))
            .count()
        )
        recent_tasks = (
            self.db.query(Task)
            .filter(and_(Task.user_id == self.user_id, Task.created_at >= self.window_start))
            .count()
        )
        capture_velocity = recent_ideas + recent_tasks

        task_switches = (
            self.db.query(Task)
            .filter(and_(Task.user_id == self.user_id, Task.updated_at >= self.window_start))
            .count()
        )

        urgency_count = await self._count_urgency_keywords()

        today_start = self.now.replace(hour=0, minute=0, second=0, microsecond=0)
        completed_today = (
            self.db.query(Task)
            .filter(and_(Task.user_id == self.user_id, Task.completed_at >= today_start))
            .count()
        )
        started_today = (
            self.db.query(Task)
            .filter(and_(Task.user_id == self.user_id, Task.created_at >= today_start))
            .count()
        )
        completion_ratio = int((completed_today / started_today) * 100) if started_today else 0

        return {
            "capture_velocity": capture_velocity,
            "task_switches": task_switches,
            "urgency_keywords": urgency_count,
            "completion_ratio": completion_ratio,
        }

    async def _count_urgency_keywords(self) -> int:
        texts = []
        tasks = (
            self.db.query(Task)
            .filter(and_(Task.user_id == self.user_id, Task.updated_at >= self.window_start))
            .all()
        )
        ideas = (
            self.db.query(Idea)
            .filter(and_(Idea.user_id == self.user_id, Idea.updated_at >= self.window_start))
            .all()
        )
        for t in tasks:
            texts.append(t.title or "")
            if t.description:
                texts.append(t.description)
        for i in ideas:
            texts.append(i.title or "")
            if i.description:
                texts.append(i.description)

        count = 0
        for text in texts:
            lower = text.lower()
            for kw in self.urgency_keywords:
                count += len(re.findall(r"\b" + re.escape(kw) + r"\b", lower))
        return count

    async def _determine_chaos_level(self, metrics: Dict) -> ChaosLevel:
        if (
            metrics["capture_velocity"] > 5
            or metrics["task_switches"] > 5
            or metrics["urgency_keywords"] > 10
            or metrics["completion_ratio"] < 50
        ):
            return ChaosLevel.SPINNING
        if (
            metrics["capture_velocity"] > 2
            or metrics["task_switches"] > 2
            or metrics["urgency_keywords"] > 5
            or metrics["completion_ratio"] < 80
        ):
            return ChaosLevel.SCATTERED
        return ChaosLevel.FOCUSED

    async def _generate_chaos_message(self, level: ChaosLevel, metrics: Dict) -> str:
        if level == ChaosLevel.FOCUSED:
            return "You seem focused and on track. Keep it up!"
        if level == ChaosLevel.SCATTERED:
            return "You're juggling quite a few things. Consider narrowing your focus."
        return "Things look pretty chaotic right now. Let's pause and regroup." 
