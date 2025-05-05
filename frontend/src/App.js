import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Home from './components/Home';
import Login from './components/Login';
import ProjectView from './components/ProjectView';
import TaskView from './components/TaskView';
import ProtectedRoute from './components/ProtectedRoute'; // Importar el componente

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas Públicas */}
          {/* Redirige la ruta raíz '/' a '/login' */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas */}
          {/* Todas las rutas dentro de este elemento requerirán autenticación */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/project/:projectId" element={<ProjectView />} />
            <Route path="/task/:taskId" element={<TaskView />} />
            {/* Puedes agregar más rutas protegidas aquí si es necesario */}
          </Route>

          {/* Ruta Comodín (Fallback) */}
          {/* Redirige cualquier ruta no definida a '/login' */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;