from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter()

@router.post("/", response_model=schemas.MembershipBase)
def create_membership(
    membership: schemas.MembershipCreate, 
    db: Session = Depends(get_db)
):
    # Verificar si el usuario existe
    user = db.query(models.User).filter(
        models.User.user_id == membership.user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verificar si el proyecto existe
    project = db.query(models.Project).filter(
        models.Project.project_id == membership.project_id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Verificar si ya existe la membresía
    existing_membership = db.query(models.Membership).filter(
        models.Membership.user_id == membership.user_id,
        models.Membership.project_id == membership.project_id
    ).first()
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership already exists"
        )

    # Crear nueva membresía
    db_membership = models.Membership(
        user_id=membership.user_id,
        project_id=membership.project_id,
        role=membership.role
    )
    db.add(db_membership)
    db.commit()
    db.refresh(db_membership)
    return db_membership

@router.get("/", response_model=List[schemas.MembershipBase])
def get_memberships(
    skip: int = 0, 
    limit: int = 100,
    project_id: int = None,
    user_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Membership)
    
    if project_id:
        query = query.filter(models.Membership.project_id == project_id)
    if user_id:
        query = query.filter(models.Membership.user_id == user_id)
    
    memberships = query.offset(skip).limit(limit).all()
    return memberships

@router.get("/{membership_id}", response_model=schemas.MembershipBase)
def get_membership(membership_id: int, db: Session = Depends(get_db)):
    membership = db.query(models.Membership).filter(
        models.Membership.membership_id == membership_id
    ).first()
    
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found"
        )
    return membership

@router.put("/{membership_id}", response_model=schemas.MembershipBase)
def update_membership(
    membership_id: int,
    membership_update: schemas.MembershipUpdate,
    db: Session = Depends(get_db)
):
    db_membership = db.query(models.Membership).filter(
        models.Membership.membership_id == membership_id
    ).first()
    
    if db_membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found"
        )

    # Verificar si es el último owner antes de cambiar el rol
    if db_membership.role == "owner" and membership_update.role != "owner":
        owner_count = db.query(models.Membership).filter(
            models.Membership.project_id == db_membership.project_id,
            models.Membership.role == "owner"
        ).count()
        if owner_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last owner of the project"
            )

    update_data = membership_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_membership, key, value)
    
    db.commit()
    db.refresh(db_membership)
    return db_membership

@router.delete("/{membership_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_membership(membership_id: int, db: Session = Depends(get_db)):
    db_membership = db.query(models.Membership).filter(
        models.Membership.membership_id == membership_id
    ).first()
    
    if db_membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found"
        )

    # Verificar si es el último owner
    if db_membership.role == "owner":
        owner_count = db.query(models.MembershipBase).filter(
            models.Membership.project_id == db_membership.project_id,
            models.Membership.role == "owner"
        ).count()
        if owner_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last owner of the project"
            )

    db.delete(db_membership)
    db.commit()
    return None

@router.get("/user/{user_id}/memberships", response_model=List[schemas.MembershipBase])
def get_user_memberships(user_id: int, db: Session = Depends(get_db)):
    # Verificar si el usuario existe
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    memberships = db.query(models.Membership).filter(
        models.Membership.user_id == user_id
    ).all()
    return memberships

@router.get("/project/{project_id}/memberships", response_model=List[schemas.MembershipBase])
def get_project_memberships(project_id: int, db: Session = Depends(get_db)):
    # Verificar si el proyecto existe
    project = db.query(models.Project).filter(
        models.Project.project_id == project_id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    memberships = db.query(models.MembershipBase).filter(
        models.Membership.project_id == project_id
    ).all()
    return memberships