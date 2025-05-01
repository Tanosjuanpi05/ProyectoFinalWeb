
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
// Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
      const data = await loginUser(email, password);
      
      // Guardar el token y la información del usuario
      if (data && data.access_token) {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('userEmail', email); // Opcional: guardar email del usuario
          
          // Verificar que el token se guardó correctamente
          const savedToken = localStorage.getItem('token');
          if (!savedToken) {
              throw new Error('Error al guardar la sesión');
          }
          
          navigate('/home');
      } else {
          throw new Error('No se recibió el token de acceso');
      }
      
  } catch (err) {
      if (err.response) {
          switch (err.response.status) {
              case 401:
                  setError('Email o contraseña incorrectos');
                  // Limpiar cualquier token anterior
                  localStorage.removeItem('token');
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
          setError('No se pudo conectar con el servidor. Verifique su conexión a internet');
      } else {
          setError(err.message || 'Ocurrió un error inesperado');
      }
      console.error('Error completo:', err);
      
      // Limpiar el localStorage en caso de error
      localStorage.removeItem('token');
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