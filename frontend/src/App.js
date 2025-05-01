import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirige la ruta raíz '/' al componente Register */}
          <Route path="/" element={<Register />} />
          
          {/* Ruta para login */}
          <Route path="/login" element={<Login />} />
          
          {/* También mantiene la ruta /register por si acaso */}
          <Route path="/register" element={<Register />} />
          
          {/* Opcional: redirige cualquier otra ruta a la página principal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;