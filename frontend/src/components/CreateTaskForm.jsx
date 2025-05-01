// src/components/CreateTaskForm.jsx
import React, { useState } from 'react';
import { taskService } from '../services/api';
import './CreateTaskForm.css';

const CreateTaskForm = ({ onClose, onTaskCreated, projects }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    due_date: '',
    project_id: '',
    assigned_to: null
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No se encontró el ID del usuario');
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        project_id: parseInt(formData.project_id),
        status: formData.status,
        due_date: formData.due_date,
        assigned_to: parseInt(userId)  // Asignar la tarea al usuario actual
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