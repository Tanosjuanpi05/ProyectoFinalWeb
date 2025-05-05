import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Verificar tanto el token como el user_id
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Si no hay token o userId, redirigir a login
  if (!token || !userId) {
    localStorage.clear(); // Limpiar todo el localStorage por seguridad
    return <Navigate to="/login" replace />;
  }

  // Si hay token y userId, permitir acceso a la ruta
  return <Outlet />;
};

export default ProtectedRoute;