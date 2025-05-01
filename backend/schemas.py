from ast import pattern
from pydantic import Field
from pydantic import BaseModel, EmailStr, validator
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


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
    role: str | None = None

### User Schemas ###
# Schema para crear usuario (entrada)
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"

class UserBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=2, 
        max_length=50, 
        pattern=r"^[a-zA-Z0-9 ]*$",
        description="Nombre del usuario"
    )
    email: EmailStr = Field(..., description="Email del usuario")
    role: UserRole = Field(default=UserRole.USER, description="Rol del usuario")

class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=50,
        description="Contraseña del usuario"
    )

    @validator('password')
    def password_strength(cls, value):
        if not any(char.isdigit() for char in value):
            raise ValueError("La contraseña debe contener al menos un número")
        if not any(char.isupper() for char in value):
            raise ValueError("La contraseña debe contener al menos una mayúscula")
        if not any(char in "!@#$%^&*()_+-=[]{}|;:,.<>?" for char in value):
            raise ValueError("La contraseña debe contener al menos un carácter especial")
        return value

class UserUpdate(BaseModel):
    name: Optional[str] = Field(
        None, 
        min_length=2, 
        max_length=50, 
        pattern=r"^[a-zA-Z0-9 ]*$",
        description="Nombre del usuario"
    )
    email: Optional[EmailStr] = Field(None, description="Email del usuario")
    password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=50,
        description="Contraseña del usuario"
    )
    role: Optional[UserRole] = None

    @validator('password')
    def password_strength(cls, value):
        if value is not None:
            if not any(char.isdigit() for char in value):
                raise ValueError("La contraseña debe contener al menos un número")
            if not any(char.isupper() for char in value):
                raise ValueError("La contraseña debe contener al menos una mayúscula")
            if not any(char in "!@#$%^&*()_+-=[]{}|;:,.<>?" for char in value):
                raise ValueError("La contraseña debe contener al menos un carácter especial")
        return value

class User(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True  

class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

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
        from_attributes = True

class ProjectWithDetails(ProjectResponse):
    owner: UserResponse
    members: List[UserResponse]
    tasks: List["TaskResponse"]
    comments: List["CommentResponse"]
    files: List["FileResponse"]

    class Config:
        from_attributes = True

### Task Schemas ###
class TaskBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=500)
    status: TaskStatus = Field(default=TaskStatus.TODO)
    due_date: datetime = Field(...)

    #@validator('due_date')
    #def validate_due_date(cls, value):
    #    # Asegurarse de que ambas fechas sean naive para la comparación
    #    now = datetime.now()
    #    if value.replace(tzinfo=None) < now:
    #        raise ValueError("La fecha límite debe ser posterior a la fecha actual")
    #    return value

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
        from_attributes = True

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
        from_attributes = True

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
        from_attributes = True

class CommentUpdate(BaseModel):
    content: Optional[str] = Field(
        None,
        min_length=1, 
        max_length=1000, 
        description="Contenido del comentario"
    )

    @validator('content')
    def content_not_empty(cls, v):
        if v is not None and v.strip() == "":
            raise ValueError("El comentario no puede estar vacío")
        return v.strip() if v else v

### MemberShip Schemas ###
class MembershipBase(BaseModel):
    role: MembershipRole = Field(
        default=MembershipRole.MEMBER,
        description="Rol del usuario en el proyecto"
    )
    is_active: bool = Field(
        default=True,
        description="Estado de la membresía"
    )

class MembershipCreate(MembershipBase):
    user_id: int = Field(..., gt=0, description="ID del usuario")
    project_id: int = Field(..., gt=0, description="ID del proyecto")

class MembershipUpdate(BaseModel):
    role: Optional[MembershipRole] = Field(
        None,
        description="Rol del usuario en el proyecto"
    )
    is_active: Optional[bool] = Field(
        None,
        description="Estado de la membresía"
    )

class Membership(MembershipBase):
    membership_id: int
    user_id: int
    project_id: int
    joined_at: datetime

    class Config:
        from_attributes = True


# Referencias forward para evitar referencias circulares
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from . import TaskResponse, CommentResponse, FileResponse