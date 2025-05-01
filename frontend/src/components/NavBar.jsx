// src/components/NavBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Eliminamos el título Project Manager */}
      </div>
    </nav>
  );
};

export default NavBar;