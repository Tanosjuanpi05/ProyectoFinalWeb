// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import { projectService, taskService } from '../services/api';
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