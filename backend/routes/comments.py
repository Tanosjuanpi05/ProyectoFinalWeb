from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=schemas.CommentBase)
def create_comment(
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db)
):
    # Verificar si el proyecto existe
    project = db.query(models.Project).filter(
        models.Project.project_id == comment.project_id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Verificar si el usuario existe
    user = db.query(models.User).filter(
        models.User.user_id == comment.user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verificar si el usuario es miembro del proyecto
    membership = db.query(models.Membership).filter(
        models.Membership.project_id == comment.project_id,
        models.Membership.user_id == comment.user_id
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this project"
        )

    # Crear nuevo comentario
    db_comment = models.Comment(
        content=comment.content,
        project_id=comment.project_id,
        user_id=comment.user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/", response_model=List[schemas.CommentBase])
def get_comments(
    skip: int = 0,
    limit: int = 100,
    project_id: int = None,
    user_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Comment)
    
    if project_id:
        query = query.filter(models.Comment.project_id == project_id)
    if user_id:
        query = query.filter(models.Comment.user_id == user_id)
    
    # Ordenar por fecha de creación (más recientes primero)
    query = query.order_by(models.Comment.created_at.desc())
    
    comments = query.offset(skip).limit(limit).all()
    return comments

@router.get("/{comment_id}", response_model=schemas.CommentBase)
def get_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(
        models.Comment.comment_id == comment_id
    ).first()
    
    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    return comment

@router.put("/{comment_id}", response_model=schemas.CommentBase)
def update_comment(
    comment_id: int,
    comment_update: schemas.CommentUpdate,
    db: Session = Depends(get_db)
):
    db_comment = db.query(models.Comment).filter(
        models.Comment.comment_id == comment_id
    ).first()
    
    if db_comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Verificar si el contenido no está vacío
    if comment_update.content and comment_update.content.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment content cannot be empty"
        )

    update_data = comment_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_comment, key, value)
    
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    db_comment = db.query(models.Comment).filter(
        models.Comment.comment_id == comment_id
    ).first()
    
    if db_comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    db.delete(db_comment)
    db.commit()
    return None

@router.get("/project/{project_id}/comments", response_model=List[schemas.CommentBase])
def get_project_comments(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
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

    comments = db.query(models.Comment).filter(
        models.Comment.project_id == project_id
    ).order_by(
        models.Comment.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return comments

@router.get("/user/{user_id}/comments", response_model=List[schemas.CommentBase])
def get_user_comments(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Verificar si el usuario existe
    user = db.query(models.User).filter(
        models.User.user_id == user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    comments = db.query(models.Comment).filter(
        models.Comment.user_id == user_id
    ).order_by(
        models.Comment.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return comments