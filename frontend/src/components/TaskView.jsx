import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Asegúrate que projectService esté importado si lo necesitas para otras cosas,
// pero para obtener el título/status del proyecto de la tarea, no lo usaremos aquí.
import { taskService } from '../services/api';
import NavBar from './NavBar';
import './TaskView.css';
import { userService } from '../services/api';

const TaskView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // ... (obtener currentUser - sin cambios)
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    if (userId) {
      const user = {
        id: parseInt(userId),
        name: userName,
        email: userEmail
      };
      setCurrentUser(user);
    }

    loadTaskData();
  }, [taskId]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      setError('');
      const taskData = await taskService.getTaskById(taskId);
      
      console.log('Datos completos de la tarea:', taskData);
  
      // Si tenemos assigned_to, obtener el email del usuario
      let assignedToEmail = 'Sin asignar';
      if (taskData.assigned_to) {
        try {
          const userData = await userService.getUserById(taskData.assigned_to);
          assignedToEmail = userData.email;
        } catch (userError) {
          console.error('Error al obtener datos del usuario asignado:', userError);
          assignedToEmail = 'Usuario no encontrado';
        }
      }
  
      setTask({
        ...taskData,
        assigned_to_email: assignedToEmail,
        project_id: taskData.project_id,
        project_title: taskData.project_title || 'Proyecto no encontrado',
        project_status: taskData.project_status || 'desconocido'
      });
  
      // ... resto del código
    } catch (error) {
      console.error('Error loading task:', error);
      setError('Error al cargar la tarea. Verifica la consola.');
    } finally {
      setLoading(false);
    }
  };

  // ... (resto de las funciones handleEditSubmit, handleDeleteTask sin cambios)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskService.updateTask(taskId, editedTask);
      setIsEditing(false);
      loadTaskData(); // Recargar datos después de editar
    } catch (error) {
      setError('Error al actualizar la tarea');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await taskService.deleteTask(taskId);
        // Idealmente, navegar al proyecto o a home
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
  // Mostrar error específico si existe
  if (error) return <div className="error-message">{error}</div>;
  // Si no hay tarea después de cargar y sin error, mostrar mensaje
  if (!task) return <div className="error-message">Tarea no encontrada o no se pudo cargar.</div>;

  // --- Renderizado ---
  return (
    <div className="task-view">
      <NavBar />
      <div className="task-view-content">
        {/* ... (Header sin cambios) ... */}
        <header className="task-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <div className="task-title-section">
            <h1>{task.title}</h1>
            <span className={`status ${task.status}`}>
              {task.status}
            </span>
          </div>
          {/* Verifica que task.created_by exista antes de comparar */}
          {currentUser && task.created_by && parseInt(currentUser.id) === parseInt(task.created_by) && (
            <div className="task-actions">
              <button onClick={() => setIsEditing(true)} className="edit-button">
                Editar
              </button>
              <button onClick={handleDeleteTask} className="delete-button">
                Eliminar Tarea
              </button>
            </div>
          )}
        </header>

        {isEditing ? (
          // ... (Formulario de edición sin cambios) ...
          <div className="edit-task-form">
            <h3>Editar Tarea</h3>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                placeholder="Título"
              />
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Descripción"
              />
              <select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
              >
                <option value="todo">Por hacer</option>
                <option value="in_progress">En progreso</option>
                <option value="review">En revisión</option>
                <option value="done">Completado</option>
              </select>
              <input
                type="date"
                value={editedTask.due_date}
                onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
              />
              {/* Aquí podrías añadir un selector para 'assigned_to' si es necesario */}
              <div className="form-actions">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="task-details">
            {/* ... (Detalles de la tarea sin cambios) ... */}
            <div className="task-info">
              <h2>Detalles de la Tarea</h2>
              <p>{task.description || 'Sin descripción.'}</p>
              <div className="task-meta">
                {/* Verifica que due_date sea una fecha válida */}
                <span>Fecha límite: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No definida'}</span>
              </div>
            </div>

            {/* Sección del Proyecto Relacionado */}
            {task.project_id && ( // Solo muestra si hay un ID de proyecto
              <div className="task-project">
                <h2>Proyecto Relacionado</h2>
                {/* Hacer clickeable si hay ID */}
                <div
                  className="project-info-card"
                  onClick={() => task.project_id && navigate(`/project/${task.project_id}`)}
                  style={{ cursor: task.project_id ? 'pointer' : 'default' }}
                >
                  {/* Muestra el título y status obtenidos */}
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