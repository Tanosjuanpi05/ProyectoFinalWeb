// src/components/CreateTaskForm.jsx
import React, { useState } from 'react';
import { taskService, projectService } from '../services/api';
import './CreateTaskForm.css';

const CreateTaskForm = ({ onClose, onTaskCreated, projects }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    due_date: '',
    project_id: '',
    assigned_to: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);

  const loadProjectMembers = async (projectId) => {
    try {
      const projectData = await projectService.getProjectById(projectId);
      setProjectMembers(projectData.members || []);
    } catch (error) {
      console.error('Error al cargar miembros del proyecto:', error);
      setError('Error al cargar la lista de miembros');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Cargar miembros del proyecto cuando se selecciona un proyecto
    if (name === 'project_id' && value) {
      loadProjectMembers(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        project_id: parseInt(formData.project_id),
        status: formData.status,
        due_date: formData.due_date,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null
      };

      console.log('Enviando datos de tarea:', taskData);
      const response = await taskService.createTask(taskData);
      console.log('Respuesta:', response);
      
      onTaskCreated(response);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.detail || 'Error al crear la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Crear Nueva Tarea</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Título de la Tarea</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength="3"
              maxLength="100"
              placeholder="Ingrese el título de la tarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              minLength="10"
              maxLength="500"
              placeholder="Describa la tarea"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="project_id">Proyecto</label>
            <select
              id="project_id"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un proyecto</option>
              {projects.map(project => (
                <option key={project.project_id} value={project.project_id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="todo">Por Hacer</option>
              <option value="in_progress">En Progreso</option>
              <option value="done">Completada</option>
              <option value="review">En Revisión</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Fecha de Vencimiento</label>
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="assigned_to">Asignar a</label>
            <select
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              disabled={!formData.project_id} // Deshabilitar si no hay proyecto seleccionado
            >
              <option value="">Sin asignar</option>
              {projectMembers.map(member => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
            {!formData.project_id && 
              <small className="helper-text">Seleccione un proyecto primero</small>
            }
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskForm;