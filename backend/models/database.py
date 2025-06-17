from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from core.database import Base

class TaskStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    DOING = "doing"
    DONE = "done"
    BLOCKED = "blocked"
    PAUSED = "paused"

class IdeaStatus(str, enum.Enum):
    ACTIVE = "active"
    DORMANT = "dormant"
    ARCHIVED = "archived"

class ChaosLevel(str, enum.Enum):
    FOCUSED = "focused"      # 🟢
    SCATTERED = "scattered"  # 🟡
    SPINNING = "spinning"    # 🔴

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tasks = relationship("Task", back_populates="user")
    ideas = relationship("Idea", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    ai_conversations = relationship("AIConversation", back_populates="user")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.NOT_STARTED)
    priority = Column(Integer, default=0)  # Higher = more important
    is_mit = Column(Boolean, default=False)  # Most Important Task
    project = Column(String(100))
    tags = Column(JSON, default=list)
    estimated_minutes = Column(Integer)
    actual_minutes = Column(Integer)
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="tasks")

class Idea(Base):
    __tablename__ = "ideas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(Enum(IdeaStatus), default=IdeaStatus.ACTIVE)
    category = Column(String(50))  # hardware, writing, business, etc.
    tags = Column(JSON, default=list)
    ai_enriched = Column(Boolean, default=False)
    ai_enrichment_data = Column(JSON)  # Keywords, research, connections
    origin = Column(String(100))  # Where the idea came from
    next_step = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="ideas")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    prompt = Column(String(200))  # The prompt that triggered this entry
    mood = Column(String(20))
    focus_level = Column(Integer)  # 1-10 scale
    roadblocks = Column(Text)
    project_tags = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="journal_entries")

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_title = Column(String(200))
    messages = Column(JSON, default=list)  # Array of message objects
    ai_participants = Column(JSON, default=list)  # ["claude", "chatgpt", "all"]
    context_data = Column(JSON)  # Related tasks, ideas, projects
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="ai_conversations")

class ChaosMetric(Base):
    __tablename__ = "chaos_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chaos_level = Column(Enum(ChaosLevel), nullable=False)
    capture_velocity = Column(Integer, default=0)  # Ideas captured in window
    task_switches = Column(Integer, default=0)     # Status changes in window
    urgency_keywords = Column(Integer, default=0)  # "urgent", "need to", etc.
    completion_ratio = Column(Integer, default=0)  # Completed vs started %
    detection_reason = Column(String(200))         # Why this level was detected
    intervention_triggered = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)