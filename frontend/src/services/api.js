
import axios from 'axios';	

const BASE_URL = "http://localhost:8000/api";

axios.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem('token');
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
  },
  (error) => {
      return Promise.reject(error);
  }
);

// Añadir el servicio de autenticación
// services/api.js
const authService = {
  loginUser: async (email, password) => {
      try {
          // Cambiar a URLSearchParams en lugar de FormData
          const formData = new URLSearchParams();
          formData.append('username', email);
          formData.append('password', password);

          const response = await axios.post(`${BASE_URL}/auth/login`, formData, {
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
              }
          });

          // Verificar la respuesta
          if (response.data && response.data.access_token) {
              return response.data;
          } else {
              throw new Error('Respuesta inválida del servidor');
          }
      } catch (error) {
          // Mejorar el manejo de errores
          if (error.response) {
              // El servidor respondió con un código de error
              const errorMessage = error.response.data?.detail || 'Error en la autenticación';
              throw new Error(errorMessage);
          } else if (error.request) {
              // No se recibió respuesta del servidor
              throw new Error('No se pudo conectar con el servidor');
          } else {
              // Error en la configuración de la petición
              throw new Error('Error al procesar la solicitud');
          }
      }
  }
};

const commentService = {
  // Crear un nuevo comentario
  createComment: async (commentData) => {
    try {
      const response = await axios.post(`${BASE_URL}/comments/`, commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los comentarios (con opciones de filtrado)
  getComments: async (params = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}/comments/`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un comentario específico por ID
  getCommentById: async (commentId) => {
    try {
      const response = await axios.get(`${BASE_URL}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un comentario
  updateComment: async (commentId, updateData) => {
    try {
      const response = await axios.put(`${BASE_URL}/comments/${commentId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un comentario
  deleteComment: async (commentId) => {
    try {
      await axios.delete(`${BASE_URL}/comments/${commentId}`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Obtener comentarios de un proyecto específico
  getProjectComments: async (projectId, params = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}/comments/project/${projectId}/comments`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener comentarios de un usuario específico
  getUserComments: async (userId, params = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}/comments/user/${userId}/comments`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};


const membershipService = {
    // Crear una nueva membresía
    createMembership: async (membershipData) => {
      try {
        const response = await axios.post(`${BASE_URL}/memberships/`, membershipData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Obtener todas las membresías (con opciones de filtrado)
    getMemberships: async (params = {}) => {
      try {
        const response = await axios.get(`${BASE_URL}/memberships/`, { params });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Obtener una membresía específica por ID
    getMembershipById: async (membershipId) => {
      try {
        const response = await axios.get(`${BASE_URL}/memberships/${membershipId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Actualizar una membresía
    updateMembership: async (membershipId, updateData) => {
      try {
        const response = await axios.put(`${BASE_URL}/memberships/${membershipId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Eliminar una membresía
    deleteMembership: async (membershipId) => {
      try {
        await axios.delete(`${BASE_URL}/memberships/${membershipId}`);
        return true;
      } catch (error) {
        throw error;
      }
    },
  
    // Obtener membresías de un usuario específico
    getUserMemberships: async (userId) => {
      try {
        const response = await axios.get(`${BASE_URL}/memberships/user/${userId}/memberships`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Obtener membresías de un proyecto específico
    getProjectMemberships: async (projectId) => {
      try {
        const response = await axios.get(`${BASE_URL}/memberships/project/${projectId}/memberships`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  };

  const projectService = {
    createProject: async (projectData) => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              throw new Error('No hay token de autenticación');
          }

          const response = await axios.post(`${BASE_URL}/projects/`, projectData, {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });
          return response.data;
      } catch (error) {
          console.error('Error en createProject:', error);
          throw error;
      }
  },

    // Obtener todos los proyectos con filtros opcionales
    getProjects: async () => {
      try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${BASE_URL}/projects/`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              },
              params: {
                  limit: 100 // Asegurarse de pedir suficientes proyectos
              }
          });
          console.log('Respuesta completa de proyectos:', response.data);
          return response.data;
      } catch (error) {
          console.error('Error al obtener proyectos:', error);
          throw error;
      }
  },
  
    // Obtener un proyecto específico con todos sus detalles
    getProjectById: async (projectId) => {
      try {
        const response = await axios.get(`${BASE_URL}/projects/${projectId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Actualizar un proyecto
    updateProject: async (projectId, updateData) => {
      try {
        const response = await axios.put(`${BASE_URL}/projects/${projectId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Eliminar un proyecto
    deleteProject: async (projectId) => {
      try {
        await axios.delete(`${BASE_URL}/projects/${projectId}`);
        return true;
      } catch (error) {
        throw error;
      }
    },
  
    // Obtener proyectos de un usuario específico
    getUserProjects: async (userId, params = {}) => {
      try {
        const response = await axios.get(`${BASE_URL}/projects/user/${userId}/projects`, {
          params: {
            status: params.status
          }
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Añadir un miembro al proyecto
    addProjectMember: async (projectId, memberData) => {
      try {
        const response = await axios.post(`${BASE_URL}/projects/${projectId}/members`, memberData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Obtener miembros de un proyecto
    getProjectMembers: async (projectId) => {
      try {
        const response = await axios.get(`${BASE_URL}/projects/${projectId}/members`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  };
  
  const taskService = {
    // Crear una nueva tarea
    createTask: async (taskData) => {
      try {
          // Asegurarse de que la fecha es futura
          const now = new Date();
          if (new Date(taskData.due_date) <= now) {
              throw new Error('La fecha límite debe ser posterior a la fecha actual');
          }
  
          const response = await axios.post(`${BASE_URL}/tasks/`, taskData);
          return response.data;
      } catch (error) {
          if (error.message === 'La fecha límite debe ser posterior a la fecha actual') {
              throw error;
          }
          console.error('Error al crear tarea:', error);
          throw error;
      }
    },
  
    // Obtener todas las tareas con filtros opcionales
    getTasks: async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              throw new Error('No hay token de autenticación');
          }

          console.log('Obteniendo tareas...'); // Debug log
          const response = await axios.get(`${BASE_URL}/tasks/`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          console.log('Respuesta de tareas:', response.data); // Debug log
          return response.data;
      } catch (error) {
          console.error('Error en getTasks:', error);
          throw error;
      }
    },
  
    // Obtener una tarea específica
    getTaskById: async (taskId) => {
      try {
        const response = await axios.get(`${BASE_URL}/tasks/${taskId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Actualizar una tarea
    updateTask: async (taskId, updateData) => {
      try {
        const response = await axios.put(`${BASE_URL}/tasks/${taskId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Eliminar una tarea
    deleteTask: async (taskId) => {
      try {
        await axios.delete(`${BASE_URL}/tasks/${taskId}`);
        return true;
      } catch (error) {
        throw error;
      }
    },
  
    // Obtener tareas de un proyecto específico
    getProjectTasks: async (projectId, status = null) => {
      try {
        const response = await axios.get(`${BASE_URL}/tasks/project/${projectId}/tasks`, {
          params: { status }
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Obtener tareas de un usuario específico
    // En api.js - taskService
    getUserTasks: async (userId) => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              throw new Error('No hay token de autenticación');
          }
        
          console.log(`Solicitando tareas para usuario ${userId}`);
          console.log('URL:', `${BASE_URL}/tasks/user/${userId}/tasks`);
          console.log('Token:', token);
        
          const response = await axios.get(`${BASE_URL}/tasks/user/${userId}/tasks`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
        
          console.log('Respuesta del servidor (tareas):', response.data);
          return response.data;
      } catch (error) {
          console.error('Error detallado en getUserTasks:', error.response || error);
          throw error;
      }
    }
  };


  const userService = {
    // Crear un nuevo usuario
      createUser: async (userData) => {
       try {
         const response = await axios.post(`${BASE_URL}/users/`, userData);
         return response.data;
       } catch (error) {
         throw error;
       }
      
    },
  
    // Obtener todos los usuarios
    getUsers: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/users/`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Obtener un usuario por ID
    getUserById: async (id) => {
      try {
        const response = await axios.get(`${BASE_URL}/users/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Actualizar un usuario
    updateUser: async (id, userData) => {
      try {
        const response = await axios.put(`${BASE_URL}/users/${id}`, userData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    // Eliminar un usuario
    deleteUser: async (id) => {
      try {
        await axios.delete(`${BASE_URL}/users/${id}`);
        return true;
      } catch (error) {
        throw error;
      }
    }
  };

  export {
    authService,
    membershipService,
    commentService,
    projectService,
    taskService,
    userService
  };

// Exportar la función loginUser directamente para facilitar su uso
export const { loginUser } = authService;