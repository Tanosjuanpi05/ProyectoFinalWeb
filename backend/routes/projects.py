from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
import models
import schemas
from datetime import datetime
from fastapi.security import OAuth2PasswordBearer
from utils.auth import verify_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    try:
        # Verificar si el usuario (owner) existe
        owner = db.query(models.User).filter(models.User.user_id == project.owner_id).first()
        if not owner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Owner not found"
            )

        # Crear nuevo proyecto
        db_project = models.Project(
            title=project.title,
            description=project.description,
            status=project.status,
            owner_id=project.owner_id
        )
        db.add(db_project)
        db.flush()  # Esto genera el project_id sin hacer commit

        # Crear membresía para el owner
        db_membership = models.Membership(
            user_id=project.owner_id,
            project_id=db_project.project_id,  # Ahora tenemos el project_id
            role=models.MembershipRole.OWNER,
            is_active=True
        )
        db.add(db_membership)
        
        # Ahora sí hacemos commit de todo
        db.commit()
        db.refresh(db_project)
        
        return db_project

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/", response_model=List[schemas.ProjectResponse])
def get_projects(
    skip: int = 0, 
    limit: int = 100,
    status: str = None,
    token: str = Depends(oauth2_scheme),  # Añadir esta línea
    db: Session = Depends(get_db)
):
    # Verificar el token
    verify_token(token)
    
    query = db.query(models.Project)
    if status:
        query = query.filter(models.Project.status == status)
    
    projects = query.offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=schemas.ProjectWithDetails)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).options(
        joinedload(models.Project.owner),
        joinedload(models.Project.members),
        joinedload(models.Project.tasks),
        joinedload(models.Project.comments),
        joinedload(models.Project.files)
    ).filter(
        models.Project.project_id == project_id
    ).first()
    
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    project_update: schemas.ProjectUpdate,
    db: Session = Depends(get_db)
):
    db_project = db.query(models.Project).filter(
        models.Project.project_id == project_id
    ).first()
    
    if db_project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(
        models.Project.project_id == project_id
    ).first()
    
    if db_project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(db_project)
    db.commit()
    return None

@router.get("/user/{user_id}/projects", response_model=List[schemas.ProjectResponse])
def get_user_projects(
    user_id: int,
    status: str = None,
    db: Session = Depends(get_db)
):
    # Verificar si el usuario existe
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Obtener proyectos donde el usuario es miembro
    query = db.query(models.Project).join(
        models.Membership,
        models.Project.project_id == models.Membership.project_id
    ).filter(models.Membership.user_id == user_id)

    if status:
        query = query.filter(models.Project.status == status)

    projects = query.all()
    return projects

@router.post("/{project_id}/members", response_model=schemas.MembershipBase)
def add_project_member(
    project_id: int,
    member: schemas.MembershipCreate,
    db: Session = Depends(get_db)
):
    # Verificar si el proyecto existe
    project = db.query(models.Project).filter(
        models.Project.project_id == project_id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Verificar si el usuario existe
    user = db.query(models.User).filter(
        models.User.user_id == member.user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verificar si ya es miembro
    existing_membership = db.query(models.Membership).filter(
        models.Membership.project_id == project_id,
        models.Membership.user_id == member.user_id
    ).first()
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this project"
        )

    # Crear nueva membresía
    db_membership = models.Membership(
        user_id=member.user_id,
        project_id=project_id,
        role=member.role
    )
    db.add(db_membership)
    db.commit()
    db.refresh(db_membership)
    return db_membership

@router.get("/{project_id}/members", response_model=List[schemas.UserResponse])
def get_project_members(project_id: int, db: Session = Depends(get_db)):
    # Verificar si el proyecto existe
    project = db.query(models.Project).filter(
        models.Project.project_id == project_id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Obtener miembros del proyecto
    members = db.query(models.User).join(
        models.Membership,
        models.User.user_id == models.Membership.user_id
    ).filter(models.Membership.project_id == project_id).all()

    return members