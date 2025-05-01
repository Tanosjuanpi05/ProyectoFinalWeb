// src/components/CreateProjectForm.jsx
import React, { useState } from 'react';
import { projectService } from '../services/api';
import './CreateProjectForm.css';

const CreateProjectForm = ({ onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active'
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
      console.log('Enviando datos:', formData);
      const response = await projectService.createProject(formData);
      console.log('Respuesta:', response);
      
      if (response) {
        onProjectCreated(response);
        onClose();
      }
    } catch (error) {
      console.error('Error completo:', error);
      // Manejo mejorado de errores
      if (typeof error.response?.data === 'string') {
        setError(error.response.data);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (Array.isArray(error.response?.data)) {
        setError(error.response.data.map(err => err.msg).join(', '));
      } else {
        setError('Error al crear el proyecto. Por favor, intente nuevamente.');
      }
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