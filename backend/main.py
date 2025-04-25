# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routes import users, projects, tasks, comments, memberships

# Crear las tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

# Inicializar FastAPI
app = FastAPI(
    title="Project Management API",
    description="API para gestión de proyectos y tareas",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir todos los routers
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(comments.router, prefix="/api/comments", tags=["Comments"])
app.include_router(memberships.router, prefix="/api/memberships", tags=["Memberships"])

@app.get("/", tags=["Root"])
async def read_root():
    return {
        "message": "Bienvenido a la API de Gestión de Proyectos",
        "version": "1.0.0",
        "status": "active",
        "documentation": "/docs",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)