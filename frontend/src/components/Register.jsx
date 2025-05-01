// src/components/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
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

      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.detail || 'Error al registrar usuario');
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