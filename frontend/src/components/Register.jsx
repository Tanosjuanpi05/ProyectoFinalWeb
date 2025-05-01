// src/components/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' // Valor por defecto
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Register.jsx
// Register.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess(false);

  if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
  }

  try {
      const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
      };
      
      const response = await userService.createUser(userData);
      setSuccess(true);
      setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user'
      });
  } catch (error) {
      if (error.response) {
          // Manejo específico para errores de validación (422)
          if (error.response.status === 422) {
              const validationErrors = error.response.data.detail;
              if (Array.isArray(validationErrors)) {
                  // Si es un array de errores, mostrar el primer mensaje
                  setError(validationErrors[0].msg);
              } else if (typeof validationErrors === 'string') {
                  // Si es un string directo
                  setError(validationErrors);
              } else {
                  // Para otros formatos de error
                  setError('Error de validación en el formulario');
              }
          } else {
              setError(error.response.data.detail || 'Error en el registro');
          }
      } else if (error.request) {
          setError('No se pudo conectar con el servidor');
      } else {
          setError('Error al procesar la solicitud');
      }
  }
};

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Crear Cuenta</h1>
          <p>Únete a nuestra plataforma</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ¡Registro exitoso! Ya puedes iniciar sesión.
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="role-select"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="moderator">Moderador</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="register-button">
            Registrarse
          </button>
        </form>
        <p className="login-link">
                ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
      </div>
    </div>
  );
};

export default Register;