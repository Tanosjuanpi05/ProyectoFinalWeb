from dataclasses import Field
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

# Enums para valores predefinidos
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator" 

class ProjectStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    REVIEW = "review"

class MembershipRole(str, Enum):
    OWNER = "owner"
    MEMBER = "member"
    VIEWER = "viewer"


### User Schemas ###
# Schema para crear usuario (entrada)
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, regex=r"^[a-zA-Z0-9 ]*$")
    email: EmailStr = Field(...)
    role: UserRole = Field(default=UserRole.USER)
    password: str = Field(..., min_length=8)

    @validator('password')
    def password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres.")
        if not any(char.isdigit() for char in value):
            raise ValueError("La contraseña debe contener al menos un número.")
        if not any(char.isupper() for char in value):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula.")
        if not any(char in "!@#$%^&*()_+-=[]{}|;:,.<>?" for char in value):
            raise ValueError("La contraseña debe contener al menos un carácter especial")
        return value

# Schema para mostrar usuario (salida)
class UserResponse(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    class Config:
        orm_mode = True

### Project Schemas ###
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    status: ProjectStatus = Field(default=ProjectStatus.ACTIVE)

class ProjectCreate(ProjectBase):
    owner_id: int

class ProjectUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[ProjectStatus]

class ProjectResponse(ProjectBase):
    project_id: int
    owner_id: int
    created_at: datetime

    class Config:
        orm_mode = True

### Task Schemas ###
class TaskBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=500)
    status: TaskStatus = Field(default=TaskStatus.TODO)
    due_date: datetime = Field(...)

    @validator("due_date")
    def validate_due_date(cls, value):
        if value < datetime.now():
            raise ValueError("La fecha de vencimiento no puede ser en el pasado.")
        return value

class TaskCreate(TaskBase):
    project_id: int
    assigned_to: Optional[int]

class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[TaskStatus]
    due_date: Optional[datetime]
    assigned_to: Optional[int]

class TaskResponse(TaskBase):
    task_id: int
    project_id: int
    assigned_to: Optional[int]

    class Config:
        orm_mode = True

### File Schemas ###
class FileBase(BaseModel):
    file_name: str = Field(..., max_length=255, description="Nombre del archivo")
    file_url: str = Field(..., max_length=500, description="URL del archivo")

class FileCreate(FileBase):
    project_id: int
    user_id: int

class FileResponse(FileBase):
    file_id: int
    project_id: int
    user_id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True

### Comment Schemas ###
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, description="Contenido del comentario")

@validator('content')
def content_not_empty(cls, v):
    if v.strip() == "":
        raise ValueError("El comentario no puede estar vacío")
    return v.strip()

class CommentCreate(CommentBase):
    project_id: int
    user_id: int

class CommentResponse(CommentBase):
    comment_id: int
    project_id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

### MemberShip Schemas ###
class MembershipBase(BaseModel):
    role: MembershipRole = Field(
        default=MembershipRole.MEMBER,
        description="Rol del usuario en el proyecto"
    )
    joined_at: datetime = Field(
        default_factory=datetime.now,
        description="Fecha de unión al proyecto"
    )
    is_active: bool = Field(
        default=True,
        description="Estado de la membresía"
    )

class MembershipRole(str, Enum):
    OWNER = "owner"
    MEMBER = "member"
    VIEWER = "viewer"

class MembershipBase(BaseModel):
    role: MembershipRole = Field(default=MembershipRole.MEMBER, description="Rol del usuario en el proyecto")

class MembershipCreate(MembershipBase):
    user_id: int
    project_id: int

class MembershipResponse(MembershipBase):
    membership_id: int
    user_id: int
    project_id: int
    joined_at: datetime

    class Config:
        orm_mode = True