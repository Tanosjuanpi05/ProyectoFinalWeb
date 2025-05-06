from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=schemas.TaskBase)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Verificar si el proyecto existe
    project = db.query(models.Project).filter(models.Project.project_id == task.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verificar si el usuario asignado existe
    if task.assigned_to:
        current_user = db.query(models.User).filter(models.User.user_id == task.assigned_to).first()
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )
        
        # Crear nueva tarea
        db_task = models.Task(
            title=task.title,
            description=task.description,
            status=task.status,
            due_date=task.due_date,
            project_id=task.project_id,
            assigned_to=task.assigned_to  # Usar directamente el ID proporcionado
        )
        
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        
        return db_task  # Asegurarse de que siempre devuelva la tarea creada
    
    # Si no hay assigned_to, lanzar una excepción
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="assigned_to is required"
    )

# En routes/tasks.py, modifica el endpoint get_task:

@router.get("/{task_id}", response_model=schemas.TaskResponse)  # Cambiar a TaskResponse
def get_task(task_id: int, db: Session = Depends(get_db)):
    # Obtener la tarea con información del proyecto usando join
    task = db.query(models.Task).join(
        models.Project,
        models.Task.project_id == models.Project.project_id
    ).filter(
        models.Task.task_id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Crear el objeto de respuesta con la información adicional
    task_response = {
        "task_id": task.task_id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "due_date": task.due_date,
        "project_id": task.project_id,
        "assigned_to": task.assigned_to,
        "project_title": task.project.title if task.project else None,
        "project_status": task.project.status if task.project else None
    }

    return task_response

@router.put("/{task_id}", response_model=schemas.TaskBase)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db)
):
    db_task = db.query(models.Task).filter(models.Task.task_id == task_id).first()
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Verificar usuario asignado si se está actualizando
    if task_update.assigned_to:
        user = db.query(models.User).filter(models.User.user_id == task_update.assigned_to).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )

    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.task_id == task_id).first()
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(db_task)
    db.commit()
    return None

@router.get("/project/{project_id}/tasks", response_model=List[schemas.TaskResponse])
def get_project_tasks(
    project_id: int,
    status: str = None,
    db: Session = Depends(get_db)
):
    # Verificar si el proyecto existe
    project = db.query(models.Project).filter(models.Project.project_id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    query = db.query(models.Task).filter(models.Task.project_id == project_id)
    
    if status:
        query = query.filter(models.Task.status == status)
    
    tasks = query.all()
    
    # Formatear la respuesta con toda la información necesaria
    task_responses = []
    for task in tasks:
        task_response = {
            "task_id": task.task_id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "due_date": task.due_date,
            "project_id": task.project_id,
            "assigned_to": task.assigned_to,
            "project_title": project.title,
            "project_status": project.status
        }
        task_responses.append(task_response)
    
    return task_responses

@router.get("/user/{user_id}/tasks", response_model=List[schemas.TaskResponse])
def get_user_tasks(
    user_id: int,
    db: Session = Depends(get_db)
):
    # Obtener las tareas con la información del proyecto
    tasks = db.query(models.Task).filter(
        models.Task.assigned_to == user_id
    ).join(
        models.Project,
        models.Task.project_id == models.Project.project_id
    ).all()

    # Formatear la respuesta manualmente para incluir todos los campos requeridos
    task_responses = []
    for task in tasks:
        task_response = {
            "task_id": task.task_id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "due_date": task.due_date,
            "project_id": task.project_id,
            "assigned_to": task.assigned_to,
            "project_title": task.project.title if task.project else None
        }
        task_responses.append(task_response)

    return task_responses