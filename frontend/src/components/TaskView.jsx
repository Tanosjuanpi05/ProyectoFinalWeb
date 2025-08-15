import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService, projectService } from '../services/api';
import NavBar from './NavBar';
import './TaskView.css';

const TaskView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);

  const loadTaskData = useCallback(async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      setError('');
      console.log('Cargando tarea con ID:', taskId);
      
      const taskData = await taskService.getTaskById(taskId);
      console.log('Datos de la tarea cargados:', taskData);
      
      if (!taskData) {
        throw new Error('No se pudo cargar la tarea');
      }

      // Si la tarea pertenece a un proyecto, cargar la información del proyecto
      if (taskData.project_id) {
        try {
          console.log('Cargando datos del proyecto:', taskData.project_id);
          const projectData = await projectService.getProjectById(taskData.project_id);
          console.log('Datos del proyecto cargados:', projectData);
          setProjectMembers(projectData.members || []);
        } catch (projectError) {
          console.error('Error al cargar datos del proyecto:', projectError);
        }
      }

      setTask(taskData);
      
      // Preparar datos para edición si es necesario
      setEditedTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        due_date: taskData.due_date ? taskData.due_date.split('T')[0] : '',
        assigned_to: taskData.assigned_to || null
      });

    } catch (error) {
      console.error('Error al cargar la tarea:', error);
      setError('Error al cargar la tarea: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (!taskId) {
      setError('ID de tarea no válido');
      setLoading(false);
      return;
    }

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userId) {
      setCurrentUser({
        id: parseInt(userId),
        name: userName,
        email: userEmail
      });
    }

    loadTaskData();
  }, [taskId, loadTaskData]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editedTask.title || !editedTask.description || !editedTask.status) {
        setError('Todos los campos son requeridos');
        return;
      }

      await taskService.updateTask(taskId, editedTask);
      setIsEditing(false);
      loadTaskData();
    } catch (error) {
      setError('Error al actualizar la tarea');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await taskService.deleteTask(taskId);
        if (task?.project_id) {
          navigate(`/project/${task.project_id}`);
        } else {
          navigate('/home');
        }
      } catch (error) {
        setError('Error al eliminar la tarea');
      }
    }
  };

  if (loading) return <div className="loading-spinner">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!task) return <div className="error-message">Tarea no encontrada</div>;

  return (
    <div className="task-view">
      <NavBar />
      <div className="task-view-content">
        <header className="task-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <div className="task-title-section">
            <h1>{task.title}</h1>
            <span className={`status ${task.status}`}>
              {task.status === 'todo' ? 'Por hacer' :
               task.status === 'in_progress' ? 'En progreso' :
               task.status === 'review' ? 'En revisión' :
               task.status === 'done' ? 'Completado' : task.status}
            </span>
          </div>
          {currentUser && task.created_by && parseInt(currentUser.id) === parseInt(task.created_by) && (
            <div className="task-actions">
              <button onClick={() => setIsEditing(true)} className="edit-button">
                Editar
              </button>
              <button onClick={handleDeleteTask} className="delete-button">
                Eliminar
              </button>
            </div>
          )}
        </header>

        {isEditing ? (
          <div className="edit-task-form">
            <h3>Editar Tarea</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="title">Título</label>
                <input
                  type="text"
                  id="title"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  placeholder="Título de la tarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  placeholder="Descripción de la tarea"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                >
                  <option value="todo">Por hacer</option>
                  <option value="in_progress">En progreso</option>
                  <option value="review">En revisión</option>
                  <option value="done">Completado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="due_date">Fecha de vencimiento</label>
                <input
                  type="date"
                  id="due_date"
                  value={editedTask.due_date}
                  onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="assigned_to">Asignar a</label>
                <select
                  id="assigned_to"
                  value={editedTask.assigned_to || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, assigned_to: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">Sin asignar</option>
                  {projectMembers.map(member => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="task-details">
            <div className="task-info">
              <h2>Detalles de la Tarea</h2>
              <p>{task.description || 'Sin descripción.'}</p>
              <div className="task-meta">
                <span>Fecha límite: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No definida'}</span>
                <div className="assignment-info">
                  <h3>Asignación</h3>
                  <p className="assigned-to">
                    {task.assigned_to ? (
                      <>
                        <strong>Asignada a: </strong> 
                        {projectMembers.find(m => m.user_id === task.assigned_to)?.name || 'Usuario no encontrado'}
                        <span className="assigned-email">
                          ({projectMembers.find(m => m.user_id === task.assigned_to)?.email})
                        </span>
                      </>
                    ) : (
                      <span className="not-assigned">Sin asignar</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {task.project_id && (
              <div className="task-project">
                <h2>Proyecto Relacionado</h2>
                <div
                  className="project-info-card"
                  onClick={() => task.project_id && navigate(`/project/${task.project_id}`)}
                  style={{ cursor: task.project_id ? 'pointer' : 'default' }}
                >
                  <h3>{task.project_title}</h3>
                  <span className={`project-status ${task.project_status}`}>
                    {task.project_status}
                  </span>
                  {task.project_id && <p className="click-hint">Haz click para ver el proyecto</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskView;