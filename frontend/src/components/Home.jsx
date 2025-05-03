// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import { projectService, taskService, userService, membershipService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import CreateProjectForm from './CreateProjectForm';
import CreateTaskForm from './CreateTaskForm';
import './Home.css';
import NavBar from './NavBar';

const Home = () => {
  const navigate = useNavigate();

  // Estado para la información del usuario
  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem('userName') || 'Usuario',
    id: localStorage.getItem('userId') || ''
  });

  const [editProject, setEditProject] = useState(null); // Estado para el proyecto que estamos editando
  const [editedProjectData, setEditedProjectData] = useState({
    title: '',
    description: '',
    status: ''
  });
  const [editTask, setEditTask] = useState(null); // Estado para la tarea que estamos editando
  const [editedTaskData, setEditedTaskData] = useState({
    title: '',
    description: '',
    status: '',
    due_date: '',
    assigned_to: ''
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0
    
  });
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
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
  };

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

    // Llamar al servicio de actualización
    await projectService.updateProject(editProject, editedProjectData);

    // Actualizar el estado local
    setProjects(prevProjects => prevProjects.map(project =>
      project.project_id === editProject 
        ? { ...project, ...editedProjectData }
        : project
    ));

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


const handleShowAddMember = async (projectId) => {
  try {
    setSelectedProject(projectId);
    
    // Obtener todos los usuarios y miembros del proyecto en paralelo
    const [allUsers, projectMembers] = await Promise.all([
      userService.getUsers(),
      membershipService.getProjectMemberships(projectId)
    ]);

    // Verificar que tenemos datos válidos
    if (!Array.isArray(allUsers)) {
      console.error('La respuesta de usuarios no es un array:', allUsers);
      throw new Error('Error al obtener la lista de usuarios');
    }

    if (!Array.isArray(projectMembers)) {
      console.error('La respuesta de miembros no es un array:', projectMembers);
      throw new Error('Error al obtener la lista de miembros');
    }

    // Obtener el ID del usuario actual
    const currentUserId = parseInt(localStorage.getItem('userId'));
    
    // Obtener los IDs de los miembros actuales del proyecto
    const memberIds = projectMembers.map(member => 
      typeof member.user_id === 'number' ? member.user_id : parseInt(member.user_id)
    );

    // Filtrar usuarios disponibles
    const filteredUsers = allUsers.filter(user => {
      const userId = typeof user.user_id === 'number' ? user.user_id : parseInt(user.user_id);
      return userId !== currentUserId && !memberIds.includes(userId);
    });

    console.log('Usuarios filtrados:', filteredUsers); // Para debugging

    setAvailableUsers(filteredUsers);
    setShowAddMember(true);
    setError(''); // Limpiar cualquier error previo

  } catch (error) {
    console.error('Error detallado:', error);
    setError('Error al cargar la lista de usuarios disponibles. Por favor, intente nuevamente.');
    setShowAddMember(false);
  }
};

const handleAddMember = async () => {
  try {
    if (!selectedUser || !selectedProject) {
      setError('Por favor seleccione un usuario');
      return;
    }

    await membershipService.createMembership({
      user_id: parseInt(selectedUser),
      project_id: selectedProject,
      role: 'member'
    });

    setShowAddMember(false);
    setSelectedUser('');
    setSelectedProject(null);
    await loadDashboardData();
    setError('');
  } catch (error) {
    console.error('Error al agregar miembro:', error);
    setError('Error al agregar el miembro al proyecto');
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
                    
                    {/* Solo mostrar los botones si el usuario actual es el owner */}
                    {project.owner_id === parseInt(userInfo.id) && (
                      <div className="card-actions">
                        <button onClick={() => handleEditProject(project.project_id)}>
                          Editar
                        </button>
                        <button onClick={() => handleDeleteProject(project.project_id)}>
                          Eliminar
                        </button>
                        <button onClick={() => handleShowAddMember(project.project_id)}>
                          Agregar Miembro
                        </button>
                      </div> )}
                      {editProject && (
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
                {showAddMember && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Agregar Miembro al Proyecto</h3>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        required
                      >
                        <option value="">Seleccione un usuario</option>
                        {availableUsers.map(user => (
                          <option key={user.user_id} value={user.user_id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                      <div className="modal-actions">
                        <button onClick={handleAddMember}>Agregar</button>
                        <button onClick={() => setShowAddMember(false)}>Cancelar</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="tasks-section">
                <h2>Tareas Recientes</h2>
                <div className="tasks-list">
                  {tasks && tasks.length > 0 ? (
                    tasks.slice(0, 5).map(task => (
                      <div key={task.task_id} className="task-card">
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
                        </div>
                        <div className="task-actions">
                          <button onClick={() => handleEditTask(task.task_id)}>
                            Editar
                          </button>
                          <button onClick={() => handleDeleteTask(task.task_id)}>
                            Eliminar
                          </button>
                        </div>
                        {editTask && (
                          <div className="edit-task-form">
                            <h3>Editar Tarea</h3>
                            <form onSubmit={handleTaskEditSubmit}>
                              <input
                                type="text"
                                value={editedTaskData.title}
                                onChange={(e) => setEditedTaskData({ ...editedTaskData, title: e.target.value })}
                                placeholder="Título"
                                required
                              />
                              <textarea
                                value={editedTaskData.description}
                                onChange={(e) => setEditedTaskData({ ...editedTaskData, description: e.target.value })}
                                placeholder="Descripción"
                                required
                              />
                              <select
                                value={editedTaskData.status}
                                onChange={(e) => setEditedTaskData({ ...editedTaskData, status: e.target.value })}
                                required
                              >
                                <option value="">Seleccione un estado</option>
                                <option value="todo">Por hacer</option>
                                <option value="in_progress">En progreso</option>
                                <option value="review">En revisión</option>
                                <option value="done">Completado</option>
                              </select>

                              <input
                                type="date"
                                value={editedTaskData.due_date}
                                onChange={(e) => setEditedTaskData({ ...editedTaskData, due_date: e.target.value })}
                                required
                              />
                              <button type="submit">Guardar cambios</button>
                              <button type="button" onClick={() => setEditTask(null)}>
                                Cancelar
                              </button>
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