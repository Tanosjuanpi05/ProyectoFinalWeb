from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from sqlalchemy import Index
import enum

# Enums para la base de datos
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"

class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    REVIEW = "review"

class MembershipRole(str, enum.Enum):
    OWNER = "owner"
    MEMBER = "member"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    owned_projects = relationship("Project", back_populates="owner")
    tasks = relationship("Task", back_populates="assigned_user")
    comments = relationship("Comment", back_populates="user")
    files = relationship("File", back_populates="user")
    memberships = relationship("Membership", back_populates="user")

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.ACTIVE)
    owner_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    owner = relationship("User", back_populates="owned_projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="project", cascade="all, delete-orphan")
    files = relationship("File", back_populates="project", cascade="all, delete-orphan")
    memberships = relationship("Membership", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    due_date = Column(DateTime(timezone=True), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks")

class File(Base):
    __tablename__ = "files"

    file_id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    project = relationship("Project", back_populates="files")
    user = relationship("User", back_populates="files")

class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    project = relationship("Project", back_populates="comments")
    user = relationship("User", back_populates="comments")

class Membership(Base):
    __tablename__ = "memberships"

    membership_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    role = Column(Enum(MembershipRole), default=MembershipRole.MEMBER)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    # Relaciones
    user = relationship("User", back_populates="memberships")
    project = relationship("Project", back_populates="memberships")

    # Índices compuestos para optimización
    __table_args__ = (
        Index('idx_user_project', user_id, project_id, unique=True),
    )