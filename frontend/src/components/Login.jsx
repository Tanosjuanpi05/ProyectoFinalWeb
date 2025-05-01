import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('1. Iniciando proceso de login');
    setError('');
    setLoading(true);
    
    try {
        console.log('2. Enviando credenciales:', { email });
        const data = await loginUser(email, password);
        console.log('3. Respuesta del servidor:', data);
        
        if (data && data.access_token) {
            console.log('4. Token recibido:', {
                token: data.access_token,
                user_id: data.user_id,
                name: data.name
            });
            
            // Guardamos todos los datos necesarios
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('userEmail', email);
            
            // Guardamos el ID del usuario
            if (data.user_id !== undefined) {
                localStorage.setItem('userId', data.user_id.toString());
                const savedUserId = localStorage.getItem('userId');
                console.log('5. User ID guardado en localStorage:', savedUserId);
            } else {
                console.warn('5. ⚠️ No se recibió user_id en la respuesta');
            }
            
            // Guardamos el nombre del usuario
            localStorage.setItem('userName', data.name || email);
            console.log('6. Nombre de usuario guardado:', data.name || email);
            
            console.log('7. Navegando a /home');
            navigate('/home');
        } else {
            console.warn('4. ⚠️ Respuesta incompleta:', data);
            throw new Error('Respuesta incompleta del servidor');
        }
    } catch (err) {
        console.error('❌ Error en login:', err);
        setError(err.message || 'Error al iniciar sesión');
    } finally {
        setLoading(false);
        console.log('8. Proceso de login completado');
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