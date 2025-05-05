# ProyectoFinalWeb

Proyecto final para la gestión de proyectos, desarrollado como parte del curso de Desarrollo Web. Este sistema permite a los usuarios gestionar proyectos, tareas, comentarios, archivos y membresías de manera eficiente.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [API Endpoints](#api-endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Validaciones](#validaciones)
- [Errores y Manejo de Excepciones](#errores-y-manejo-de-excepciones)
- [Desarrollo y Pruebas](#desarrollo-y-pruebas)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

---

## Descripción

Este proyecto es una aplicación web para la gestión de proyectos. Los usuarios pueden crear proyectos, asignar tareas, agregar comentarios, subir archivos y gestionar membresías. La aplicación incluye un backend desarrollado con FastAPI y un frontend construido con React.

---

## Características

- **Gestión de Proyectos**: Crear, editar y eliminar proyectos.
- **Gestión de Tareas**: Asignar tareas a proyectos y usuarios.
- **Comentarios**: Agregar y gestionar comentarios en proyectos.
- **Archivos**: Subir y gestionar archivos relacionados con proyectos.
- **Membresías**: Gestionar miembros de proyectos con roles específicos.
- **Autenticación**: Sistema de autenticación basado en JWT.
- **Interfaz de Usuario**: Interfaz moderna y responsiva con React.

---

## Tecnologías Utilizadas

### Backend
- **Framework**: FastAPI
- **Base de Datos**: MySQL con SQLAlchemy ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Documentación**: Swagger UI / ReDoc

### Frontend
- **Framework**: React
- **Estilos**: CSS y librerías personalizadas
- **Gestión de Estado**: Hooks de React

---

## Estructura del Proyecto

```
ProyectoFinalWeb/
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│   ├── schemas.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── comments.py
│   │   ├── memberships.py
│   │   ├── projects.py
│   │   ├── tasks.py
│   │   └── users.py
│   └── utils/
│       └── auth.py
├── frontend/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── CreateProjectForm.jsx
│   │   │   ├── CreateTaskForm.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── ProjectView.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Register.jsx
│   │   │   └── TaskView.jsx
│   │   └── services/
│       └── api.js
```

---

## Instalación y Configuración

### Backend

1. Clona el repositorio:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Crea y activa un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configura las variables de entorno en un archivo `.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_DATABASE=project_management
   ```

5. Ejecuta el servidor:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Navega al directorio `frontend`:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación:
   ```bash
   npm start
   ```

---

## API Endpoints

### Usuarios
- `POST /api/users/` - Crear usuario
- `GET /api/users/` - Obtener todos los usuarios
- `GET /api/users/{user_id}` - Obtener usuario específico
- `PUT /api/users/{user_id}` - Actualizar usuario
- `DELETE /api/users/{user_id}` - Eliminar usuario

### Proyectos
- `POST /api/projects/` - Crear proyecto
- `GET /api/projects/` - Obtener todos los proyectos
- `GET /api/projects/{project_id}` - Obtener detalles de un proyecto
- `PUT /api/projects/{project_id}` - Actualizar proyecto
- `DELETE /api/projects/{project_id}` - Eliminar proyecto

### Tareas
- `POST /api/tasks/` - Crear tarea
- `GET /api/tasks/` - Obtener todas las tareas
- `GET /api/tasks/{task_id}` - Obtener tarea específica
- `PUT /api/tasks/{task_id}` - Actualizar tarea
- `DELETE /api/tasks/{task_id}` - Eliminar tarea

### Comentarios
- `POST /api/comments/` - Crear comentario
- `GET /api/comments/` - Obtener todos los comentarios
- `GET /api/comments/{comment_id}` - Obtener comentario específico
- `PUT /api/comments/{comment_id}` - Actualizar comentario
- `DELETE /api/comments/{comment_id}` - Eliminar comentario

---

## Modelos de Datos

### Usuario
```json
{
    "user_id": int,
    "name": str,
    "email": str,
    "role": Enum["admin", "user", "moderator"],
    "created_at": datetime
}
```

### Proyecto
```json
{
    "project_id": int,
    "title": str,
    "description": str,
    "status": Enum["active", "completed", "on_hold", "cancelled"],
    "owner_id": int,
    "created_at": datetime
}
```

### Tarea
```json
{
    "task_id": int,
    "title": str,
    "description": str,
    "status": Enum["todo", "in_progress", "done", "review"],
    "due_date": datetime,
    "project_id": int,
    "assigned_to": Optional[int]
}
```

---

## Validaciones

- **Usuarios**:
  - Nombre: 2-50 caracteres, alfanumérico.
  - Email: Formato válido.
  - Contraseña: Mínimo 8 caracteres, al menos un número, una letra mayúscula y un carácter especial.

- **Proyectos**:
  - Título: 3-100 caracteres.
  - Descripción: 10-1000 caracteres.
  - Estado: Valor válido del enum.

- **Tareas**:
  - Título: 3-100 caracteres.
  - Descripción: 10-500 caracteres.
  - Fecha de vencimiento: Debe ser futura.

---

## Errores y Manejo de Excepciones

El API utiliza códigos de estado HTTP estándar:

| Código | Descripción           |
|-------|-----------------------|
| 200   | Éxito                |
| 201   | Creado               |
| 400   | Solicitud Incorrecta |
| 401   | No Autorizado        |
| 403   | Prohibido            |
| 404   | No Encontrado        |
| 500   | Error Interno        |

---

## Desarrollo y Pruebas

### Modo Desarrollo
Ejecuta el backend en modo desarrollo:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Ejecuta el frontend en modo desarrollo:
```bash
npm start
```

### Pruebas
Ejecuta las pruebas del backend:
```bash
pytest
```

---

## Contribuciones

1. Haz un fork del repositorio.
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza los cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`).
4. Haz push a tu rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

---

## Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).
