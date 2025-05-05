import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Asegúrate que useNavigate esté importado
import { userService } from '../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate(); // Hook para la navegación

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

      // Llama al servicio para crear el usuario
      await userService.createUser(userData);
      setSuccess(true); // Muestra mensaje de éxito
      setFormData({ // Limpia el formulario
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
      });

      // Redirige a la página de Login después de 2 segundos
      setTimeout(() => {
        navigate('/login'); // Cambiado de '/home' a '/login'
      }, 2000); // Mantiene el delay para que el usuario vea el mensaje de éxito

    } catch (error) {
      setError(error.response?.data?.detail || 'Error al registrar usuario');
    }
  };

  // ... resto del código del componente Register permanece igual
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
            ¡Registro exitoso! Serás redirigido para iniciar sesión.
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* ... campos del formulario ... */}
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
              placeholder="••••"
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
              placeholder="••••"
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