// src/components/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { projectService, taskService, userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import CreateProjectForm from './CreateProjectForm';
import CreateTaskForm from './CreateTaskForm';
import './Home.css';
import NavBar from './NavBar';

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ pendingTasks: 0, completedTasks: 0 });
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [editedProjectData, setEditedProjectData] = useState({
    title: '',
    description: '',
    status: ''
  });
  const [editTask, setEditTask] = useState(null);
  const [editedTaskData, setEditedTaskData] = useState({
    title: '',
    description: '',
    status: '',
    due_date: '',
    assigned_to: ''
  });
  const [userInfo] = useState({
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('userName'),
    email: localStorage.getItem('userEmail')
  });
  const [availableUsers, setAvailableUsers] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Obtener el ID del usuario actual
      const userId = localStorage.getItem('userId');
      console.log('ID del usuario actual:', userId);

      // Obtener proyectos y tareas del usuario
      const [projectsData, tasksData] = await Promise.all([
        projectService.getUserProjects(userId),
        taskService.getUserTasks(userId)  // Cambiar a getUserTasks
      ]);

      console.log('Proyectos del usuario:', projectsData);
      console.log('Tareas del usuario:', tasksData);

      // Calcular stats con las tareas del usuario
      const pending = tasksData.filter(task => 
        task.status.toLowerCase() === 'todo' || 
        task.status.toLowerCase() === 'in_progress'
      ).length;

      const completed = tasksData.filter(task => 
        task.status.toLowerCase() === 'done'
      ).length;

      setProjects(projectsData);
      setTasks(tasksData);
      setStats({
        pendingTasks: pending,
        completedTasks: completed
      });

    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(`Error al cargar los datos: ${error.response.data?.detail || 'Error del servidor'}`);
        }
      } else if (error.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al cargar los datos: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadDashboardData();
    
    // Cargar lista de usuarios
    const loadUsers = async () => {
      try {
        const users = await userService.getUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };
    loadUsers();
  }, [navigate, loadDashboardData]);

  const handleProjectCreated = (newProject) => {
    setProjects(prevProjects => [newProject, ...prevProjects]);
    loadDashboardData();
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
    loadDashboardData();
  };


  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm('¿Estás seguro que deseas eliminar este proyecto? Esta acción no se puede deshacer.');
    
    if (confirmDelete) {
      try {
        const success = await projectService.deleteProject(projectId);
        if (success) {
          // Primero actualizamos el estado local
          setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
          // Luego recargamos todos los datos del dashboard
          await loadDashboardData();
        }
      } catch (error) {
        console.error('Error al eliminar el proyecto:', error);
        setError('No se pudo eliminar el proyecto.');
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm('¿Estás seguro que deseas eliminar esta tarea? Esta acción no se puede deshacer.');
    
    if (confirmDelete) {
      try {
        const success = await taskService.deleteTask(taskId);
        if (success) {
          // Primero actualizamos el estado local
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
          // Luego recargamos todos los datos del dashboard
          await loadDashboardData();
        }
      } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        setError('No se pudo eliminar la tarea.');
      }
    }
  };

const handleEditTask = (taskId) => {
  // Encuentra la tarea usando task_id
  const task = tasks.find((t) => t.task_id === taskId);
  if (!task) {
    console.error('Tarea no encontrada');
    return;
  }
  
  setEditTask(taskId);
  setEditedTaskData({
    title: task.title,
    description: task.description,
    status: task.status,
    due_date: task.due_date.split('T')[0], // Formatear la fecha para el input date
    assigned_to: task.assigned_to || ''
  });
};

const handleTaskEditSubmit = async (e) => {
  e.preventDefault();
  
  try {
    if (!editTask || !editedTaskData) {
      throw new Error('Datos de edición inválidos');
    }

    // Validar los campos requeridos
    if (!editedTaskData.title || !editedTaskData.description || 
        !editedTaskData.status || !editedTaskData.due_date) {
      setError('Todos los campos son requeridos');
      return;
    }

    // Llamar al servicio de actualización
    await taskService.updateTask(editTask, editedTaskData);

    // Actualizar el estado local
    setTasks(prevTasks => prevTasks.map(task =>
      task.task_id === editTask 
        ? { ...task, ...editedTaskData }
        : task
    ));

    // Limpiar el estado de edición y errores
    setEditTask(null);
    setEditedTaskData({
      title: '',
      description: '',
      status: '',
      due_date: '',
      assigned_to: ''
    });
    setError('');
    
    // Opcional: Recargar los datos
    await loadDashboardData();

  } catch (error) {
    console.error('Error al editar la tarea:', error);
    setError('Error al actualizar la tarea: ' + error.message);
  }
};

const handleEditProject = (projectId) => {
  // Encuentra el proyecto usando project_id
  const project = projects.find((p) => p.project_id === projectId);
  if (!project) {
    console.error('Proyecto no encontrado');
    return;
  }
  
  setEditProject(projectId);
  setEditedProjectData({
    title: project.title,
    description: project.description,
    status: project.status,
  });
};

// Función para enviar el formulario de edición de proyecto
const handleProjectEditSubmit = async (e) => {
  e.preventDefault();
  
  try {
    if (!editProject || !editedProjectData) {
      throw new Error('Datos de edición inválidos');
    }

    // Validar los campos requeridos
    if (!editedProjectData.title || !editedProjectData.description || !editedProjectData.status) {
      setError('Todos los campos son requeridos');
      return;
    }
    // Limpiar el estado de edición y errores
    setEditProject(null);
    setEditedProjectData({
      title: '',
      description: '',
      status: ''
    });
    setError('');
    
    // Opcional: Recargar los datos
    await loadDashboardData();

  } catch (error) {
    console.error('Error al editar el proyecto:', error);
    setError('Error al actualizar el proyecto: ' + error.message);
  }
};


  return (
    <div className="home-page">
      <NavBar />
      <div className="home-content">
        <main className="main-content">
          <header className="content-header">
            <div className="welcome-section">
              <h1>Dashboard</h1>
              <p className="welcome-text">
                Bienvenido: {userInfo.name} (ID: {userInfo.id})
              </p>
            </div>
            <div className="header-actions">
              <button 
                className="create-button"
                onClick={() => setShowCreateProject(true)}
              >
                + Nuevo Proyecto
              </button>
              <button 
                className="create-button"
                onClick={() => setShowCreateTask(true)}
              >
                + Nueva Tarea
              </button>
            </div>
          </header>

          {loading ? (
            <div className="loading-spinner">Cargando...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="dashboard-content">
              <section className="stats-section">
                <div className="stat-card">
                  <h3>Proyectos Activos</h3>
                  <p className="stat-number">{projects.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Tareas Pendientes</h3>
                  <p className="stat-number">{stats.pendingTasks}</p>
                </div>
                <div className="stat-card">
                  <h3>Tareas Completadas</h3>
                  <p className="stat-number">{stats.completedTasks}</p>
                </div>
              </section>

              <section className="projects-section">
                <h2>Proyectos Recientes</h2>
                <div className="projects-grid">
                {projects.map(project => (
                <div key={project.project_id} className="project-card">
                  <div 
                    className="card-content"
                    onClick={() => navigate(`/project/${project.project_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-header">
                      <h3 title={project.title}>{project.title}</h3>
                      <span className={`status ${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                    <p title={project.description}>
                      {project.description.length > 100 
                        ? `${project.description.substring(0, 100)}...` 
                        : project.description}
                    </p>
                    <div className="card-footer">
                      <span>Miembros: {project.members?.length || 0}</span>
                      <span>Tareas: {project.tasks?.length || 0}</span>
                    </div>
                  </div>
                  
                  {/* Botones de acción fuera del área clickeable */}
                  {project.owner_id === parseInt(userInfo.id) && (
                    <div className="card-actions" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleEditProject(project.project_id)}>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteProject(project.project_id)}>
                        Eliminar
                      </button>
                    </div> )}
                      {editProject === project.project_id && (
                       <div className="edit-project-form">
                          <h3>Editar Proyecto</h3>
                          <form onSubmit={handleProjectEditSubmit}>
                            <input
                              type="text"
                              value={editedProjectData.title}
                              onChange={(e) => setEditedProjectData({ ...editedProjectData, title: e.target.value })}
                              placeholder="Título"
                              required
                            />
                            <textarea
                              value={editedProjectData.description}
                              onChange={(e) => setEditedProjectData({ ...editedProjectData, description: e.target.value })}
                              placeholder="Descripción"
                              required
                            />
                            <select
                              value={editedProjectData.status}
                              onChange={(e) => setEditedProjectData({ ...editedProjectData, status: e.target.value })}
                              required
                            >
                              <option value="">Seleccione un estado</option>
                              <option value="active">Activo</option>
                              <option value="completed">Completado</option>
                              <option value="on_hold">En espera</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                            <button type="submit">Guardar cambios</button>
                            <button type="button" onClick={() => setEditProject(null)}>Cancelar</button>
                          </form>
                        </div>
                      )}
                    </div>
                ))}
                </div>
              </section>
              <section className="tasks-section">
                <h2>Tareas Recientes</h2>
                <div className="tasks-list">
                  {tasks && tasks.length > 0 ? (
                    tasks.slice(0, 5).map(task => (
                      <div key={task.task_id} className="task-card">
                        <div 
                          className="task-content"
                          onClick={() => navigate(`/task/${task.task_id}`)}
                          style={{ cursor: 'pointer' }}>
                          <div className="task-header">
                            <h4>{task.title}</h4>
                            <span className={`status ${task.status}`}>
                              {task.status}
                            </span>
                          </div>
                          <p>{task.description}</p>
                          <div className="task-footer">
                            <span>Vence: {new Date(task.due_date).toLocaleDateString()}</span>
                            <span>Proyecto: {task.project_title || 'Sin proyecto'}</span>
                            <span>Asignada a: {availableUsers.find(u => u.user_id === task.assigned_to)?.name || 'Sin asignar'}</span>
                          </div>
                        </div>

                        <div className="task-actions" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleEditTask(task.task_id)}>
                            Editar
                          </button>
                          <button onClick={() => handleDeleteTask(task.task_id)}>
                            Eliminar
                          </button>
                        </div>

                        {editTask === task.task_id && (
                          <div className="edit-task-form">
                            <h3>Editar Tarea</h3>
                            {error && <div className="error-message">{error}</div>}
                            <form onSubmit={handleTaskEditSubmit}>
                              <div className="form-group">
                                <label htmlFor="title">Título</label>
                                <input
                                  type="text"
                                  id="title"
                                  value={editedTaskData.title}
                                  onChange={(e) => setEditedTaskData({ ...editedTaskData, title: e.target.value })}
                                  placeholder="Título de la tarea"
                                  required
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor="description">Descripción</label>
                                <textarea
                                  id="description"
                                  value={editedTaskData.description}
                                  onChange={(e) => setEditedTaskData({ ...editedTaskData, description: e.target.value })}
                                  placeholder="Descripción de la tarea"
                                  rows="4"
                                  required
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor="status">Estado</label>
                                <select
                                  id="status"
                                  value={editedTaskData.status}
                                  onChange={(e) => setEditedTaskData({ ...editedTaskData, status: e.target.value })}
                                  required
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
                                  value={editedTaskData.due_date}
                                  onChange={(e) => setEditedTaskData({ ...editedTaskData, due_date: e.target.value })}
                                  required
                                />
                              </div>

                              <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={() => setEditTask(null)}>
                                  Cancelar
                                </button>
                                <button type="submit" className="submit-button">
                                  Guardar cambios
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-tasks-message">
                      No hay tareas recientes
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {showCreateProject && (
        <CreateProjectForm
          onClose={() => setShowCreateProject(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {showCreateTask && (
        <CreateTaskForm
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={handleTaskCreated}
          projects={projects}
        />
      )}
    </div>
  );
};

export default Home;