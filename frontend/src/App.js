// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirige la ruta raíz '/' al componente Register */}
          <Route path="/" element={<Register />} />
          
          {/* También mantiene la ruta /register por si acaso */}
          <Route path="/register" element={<Register />} />
          
          {/* Opcional: redirige cualquier otra ruta a la página principal */}
          <Route path="*" element={<Navigate to="/" replace />} />

          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;