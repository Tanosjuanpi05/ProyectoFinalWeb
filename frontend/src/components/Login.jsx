
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api'; // Importamos la función de login desde el servicio API
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      navigate('/home');
      
  } catch (err) {
      if (err.response) {
          // Error de respuesta del servidor
          switch (err.response.status) {
              case 401:
                  setError('Email o contraseña incorrectos');
                  break;
              case 422:
                  setError('Formato de email o contraseña inválido');
                  break;
              case 500:
                  setError('Error en el servidor. Por favor, intente más tarde');
                  break;
              default:
                  setError('Error al iniciar sesión. Por favor, intente nuevamente');
          }
      } else if (err.request) {
          // Error de conexión
          setError('No se pudo conectar con el servidor. Verifique su conexión a internet');
      } else {
          // Otros errores
          setError('Ocurrió un error inesperado. Por favor, intente nuevamente');
      }
      console.error('Error detallado:', err);
  } finally {
      setLoading(false);
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar Sesión</h1>
        <p className="welcome-text">Bienvenido de nuevo</p>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        
        <p className="register-link">
          ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;