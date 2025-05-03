import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, taskService, userService, membershipService } from '../services/api';
import NavBar from './NavBar';
import './ProjectView.css';

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Obtener los datos del usuario del localStorage como se guardan en Login
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
  
    if (userId) {
      const user = {
        id: parseInt(userId),
        name: userName,
        email: userEmail
      };
      console.log('Usuario recuperado:', user);
      setCurrentUser(user);
    }
    
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getProjectById(projectId);
      const projectTasks = await taskService.getProjectTasks(projectId);
      
      console.log('Datos del proyecto:', projectData);
      
      setProject(projectData);
      setTasks(projectTasks);
      setMembers(projectData.members); // Usar los miembros del proyecto directamente
      setEditedProject({
        title: projectData.title,
        description: projectData.description,
        status: projectData.status
      });
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };
  

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectService.updateProject(projectId, editedProject);
      setIsEditing(false);
      loadProjectData();
    } catch (error) {
      setError('Error al actualizar el proyecto');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        await projectService.deleteProject(projectId);
        navigate('/home');
      } catch (error) {
        setError('Error al eliminar el proyecto');
      }
    }
  };

  const handleShowAddMember = async () => {
    try {
      const allUsers = await userService.getUsers();
      const memberIds = members.map(member => member.user_id);
      const filteredUsers = allUsers.filter(user => !memberIds.includes(user.user_id));
      setAvailableUsers(filteredUsers);
      setShowAddMember(true);
    } catch (error) {
      setError('Error al cargar usuarios disponibles');
    }
  };

  const handleAddMember = async () => {
    try {
      // Validar que se haya seleccionado un usuario
      if (!selectedUser) {
        setError('Por favor seleccione un usuario');
        return; // Detener la ejecución si no hay usuario seleccionado
      }
  
      await membershipService.createMembership({
        user_id: parseInt(selectedUser),
        project_id: parseInt(projectId),
        role: 'member'
      });
      setShowAddMember(false);
      setSelectedUser('');
      loadProjectData();
    } catch (error) {
      setError('Error al agregar miembro');
    }
  };

  if (loading) return <div className="loading-spinner">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!project) return <div className="error-message">Proyecto no encontrado</div>;

  return (
    <div className="project-view">
      <NavBar />
      <div className="project-view-content">
        <header className="project-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <div className="project-title-section">
            <h1>{project.title}</h1>
            <span className={`status ${project.status}`}>
              {project.status}
            </span>
          </div>
{currentUser && parseInt(currentUser.id) === parseInt(project.owner_id) && (
  <div className="project-actions">
    <button onClick={() => setIsEditing(true)} className="edit-button">
      Editar
    </button>
    <button onClick={handleShowAddMember} className="add-member-button">
      Agregar Miembro
    </button>
    <button onClick={handleDeleteProject} className="delete-button">
      Eliminar Proyecto
    </button>
  </div>
)}
        </header>

        {isEditing ? (
          <div className="edit-project-form">
            <h3>Editar Proyecto</h3>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                value={editedProject.title}
                onChange={(e) => setEditedProject({...editedProject, title: e.target.value})}
                placeholder="Título"
              />
              <textarea
                value={editedProject.description}
                onChange={(e) => setEditedProject({...editedProject, description: e.target.value})}
                placeholder="Descripción"
              />
              <select
                value={editedProject.status}
                onChange={(e) => setEditedProject({...editedProject, status: e.target.value})}
              >
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
                <option value="on_hold">En espera</option>
              </select>
              <div className="form-actions">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="project-details">
            <div className="project-info">
              <h2>Detalles del Proyecto</h2>
              <p>{project.description}</p>
              <div className="project-meta">
                <span>Creado por: {project.owner_name}</span>
                <span>Miembros: {members.length}</span>
              </div>
            </div>
            <div className="project-members">
            <h2>Miembros del Proyecto</h2>
            <div className="members-grid">
                {project.members.map((member) => (
                <div 
                    key={member.user_id} 
                    className={`member-card ${member.user_id === project.owner_id ? 'owner-card' : ''}`}
                >
                    <div className="member-info">
                    <div className="member-header">
                        <h3>{member.name}</h3>
                        {member.user_id === project.owner_id && (
                        <span className="owner-badge">
                            👑 Owner
                        </span>
                        )}
                    </div>
                    <div className="member-details">
                        <span className="member-id">ID: {member.user_id}</span>
                        <span className={`role-badge ${member.role?.toLowerCase()}`}>
                        {member.role}
                        </span>
                    </div>
                    <span className="member-email">{member.email}</span>
                    <span className="member-created">
                        Unido: {new Date(member.created_at).toLocaleDateString()}
                    </span>
                    </div>
                </div>
                ))}
            </div>
            </div>
            <div className="project-tasks">
              <h2>Tareas del Proyecto</h2>
              <div className="tasks-grid">
                {tasks.map(task => (
                  <div key={task.task_id} className="task-card">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span className={`status ${task.status}`}>
                        {task.status}
                      </span>
                    </div>
                    <p>{task.description}</p>
                    <div className="task-footer">
                      <span>Vence: {new Date(task.due_date).toLocaleDateString()}</span>
                      <span>Asignado a: {task.assigned_to_name || 'Sin asignar'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showAddMember && (
        <div className="modal">
            <div className="modal-content">
            <h3>Agregar Miembro al Proyecto</h3>
            <div className="modal-form">
                <select
                value={selectedUser}
                onChange={(e) => {
                    setSelectedUser(e.target.value);
                    setError(''); // Limpiar error cuando se selecciona un usuario
                }}
                className={!selectedUser && error ? 'select-error' : ''}
                >
                <option value="">Seleccione un usuario</option>
                {availableUsers.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                    {user.name} ({user.email})
                    </option>
                ))}
                </select>
                {!selectedUser && error && (
                <span className="form-error-message">Por favor seleccione un usuario</span>
                )}
                <div className="modal-actions">
                <button onClick={handleAddMember}>Agregar</button>
                <button onClick={() => {
                    setShowAddMember(false);
                    setError(''); // Limpiar error al cerrar
                }}>Cancelar</button>
                </div>
            </div>
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;