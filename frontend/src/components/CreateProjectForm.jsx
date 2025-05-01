import React, { useState } from 'react';
import { projectService } from '../services/api';
import './CreateProjectForm.css';

const CreateProjectForm = ({ onClose, onProjectCreated }) => {
  // Añadir los estados faltantes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active'
  });

  // Añadir la función handleChange que faltaba
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

    const userId = localStorage.getItem('userId');
    console.log('userId recuperado:', userId);

    if (!userId) {
      setError('No se encontró el ID del usuario. Por favor, inicie sesión nuevamente.');
      setIsSubmitting(false);
      return;
    }

    try {
      const projectData = {
        ...formData,
        owner_id: parseInt(userId)
      };
      
      console.log('Datos del proyecto a enviar:', projectData);
      const response = await projectService.createProject(projectData);
      
      if (response) {
        onProjectCreated(response);
        onClose();
      }
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      setError(error.response?.data?.detail || 'Error al crear el proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Crear Nuevo Proyecto</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          {/* Solo mostrar error si es una cadena de texto */}
          {error && typeof error === 'string' && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Título del Proyecto</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength="3"
              maxLength="100"
              placeholder="Ingrese el título del proyecto"
              disabled={isSubmitting}
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
              maxLength="1000"
              placeholder="Describa el proyecto"
              rows="4"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="active">Activo</option>
              <option value="on_hold">En Espera</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
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
              {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;