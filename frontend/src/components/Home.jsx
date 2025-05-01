// src/components/Home.jsx
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
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false); // Nuevo estado

  // Home.jsx
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
        
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
      
        const projectsPromise = projectService.getProjects();
        const tasksPromise = taskService.getTasks();
      
        const [projectsData, tasksData] = await Promise.all([
            projectsPromise,
            tasksPromise
        ]);
      
        setProjects(projectsData || []);
        setTasks(tasksData || []);
    } catch (error) {
        console.error('Error detallado:', error);
        if (error.message === 'No hay token de autenticación') {
            navigate('/login');
        } else if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError(`Error al cargar los datos: ${error.response.data?.detail || 'Error del servidor'}`);
            }
        } else if (error.request) {
            setError('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo.');
        } else {
            setError('Error al cargar los datos: ' + error.message);
        }
    } finally {
        setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    console.log('Nuevo proyecto creado:', newProject);
    setProjects(prevProjects => [newProject, ...prevProjects]);
    loadDashboardData();
  };

  const handleTaskCreated = (newTask) => {
    console.log('Nueva tarea creada:', newTask);
    setTasks(prevTasks => [newTask, ...prevTasks]);
    loadDashboardData();
  };

  return (
    <div className="home-page">
      <NavBar />
      <div className="home-content">
        <main className="main-content">
          <header className="content-header">
            <h1>Dashboard</h1>
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
                  <p className="stat-number">
                    {tasks.filter(task => task.status === 'pending').length}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Tareas Completadas</h3>
                  <p className="stat-number">
                    {tasks.filter(task => task.status === 'completed').length}
                  </p>
                </div>
              </section>

              <section className="projects-section">
                <h2>Proyectos Recientes</h2>
                <div className="projects-grid">
                  {projects.slice(0, 4).map(project => (
                    <div key={project.project_id} className="project-card">
                      <div className="card-header">
                        <h3>{project.title}</h3>
                        <span className={`status ${project.status}`}>
                          {project.status}
                        </span>
                      </div>
                      <p>{project.description}</p>
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
                  {tasks.slice(0, 5).map(task => (
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
                        <span>Proyecto: {task.project_title}</span>
                      </div>
                    </div>
                  ))}
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

      <button 
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          navigate('/');
        }} 
        className="logout-button-fixed"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Home;