# ProyectoFinalWeb
Proyecto final - Desarrollo Web

## Backend Documentation - Project Management API

### Overview
This is a RESTful API built with FastAPI for a project management system. It provides endpoints for managing users, projects, tasks, comments, files, and project memberships.

### Technology Stack
- **Framework**: FastAPI
- **Database**: MySQL with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI / ReDoc

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── routes/
│       ├── __init__.py
│       ├── users.py
│       ├── projects.py
│       ├── tasks.py
│       ├── comments.py
│       ├── files.py
│       └── memberships.py
├── requirements.txt
└── .env
```

## Installation and Setup

### Clone the repository
```bash
git clone <repository-url>
cd backend
```

### Create and activate virtual environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Configure environment variables
Create a `.env` file with:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=project_management
```

### Run the application
```bash
uvicorn app.main:app --reload
```

## API Endpoints

### Users
- `POST /api/users/` - Create new user
- `GET /api/users/` - Get all users
- `GET /api/users/{user_id}` - Get specific user
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/` - Get all projects
- `GET /api/projects/{project_id}` - Get project details
- `PUT /api/projects/{project_id}` - Update project
- `DELETE /api/projects/{project_id}` - Delete project
- `GET /api/projects/{project_id}/members` - Get project members

### Tasks
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/` - Get all tasks
- `GET /api/tasks/{task_id}` - Get specific task
- `PUT /api/tasks/{task_id}` - Update task
- `DELETE /api/tasks/{task_id}` - Delete task
- `GET /api/projects/{project_id}/tasks` - Get project tasks

### Comments
- `POST /api/comments/` - Create new comment
- `GET /api/comments/` - Get all comments
- `GET /api/comments/{comment_id}` - Get specific comment
- `PUT /api/comments/{comment_id}` - Update comment
- `DELETE /api/comments/{comment_id}` - Delete comment
- `GET /api/projects/{project_id}/comments` - Get project comments

### Files
- `POST /api/files/` - Upload file
- `GET /api/files/` - Get all files
- `GET /api/files/{file_id}` - Get file details
- `DELETE /api/files/{file_id}` - Delete file
- `GET /api/projects/{project_id}/files` - Get project files

### Memberships
- `POST /api/memberships/` - Create membership
- `GET /api/memberships/` - Get all memberships
- `PUT /api/memberships/{membership_id}` - Update membership
- `DELETE /api/memberships/{membership_id}` - Delete membership

## Data Models

### User
```json
{
    "user_id": int,
    "name": str,
    "email": str,
    "role": Enum["admin", "user", "moderator"],
    "created_at": datetime
}
```

### Project
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

### Task
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

## Validation Rules

### Users
- Name: 2-50 characters, alphanumeric
- Email: Valid email format
- Password:
    - Minimum 8 characters
    - At least one number
    - At least one uppercase letter
    - At least one special character

### Projects
- Title: 3-100 characters
- Description: 10-1000 characters
- Valid status enum value

### Tasks
- Title: 3-100 characters
- Description: 10-500 characters
- Due date must be in the future
- Valid status enum value

## Error Handling
The API uses standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 500  | Internal Server Error |

## Documentation
API documentation is available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development
To run in development mode:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Testing
To run tests:

```bash
pytest
```

## Dependencies
- fastapi
- uvicorn
- sqlalchemy
- pydantic
- python-dotenv
- mysql-connector-python
- email-validator
- python-jose[cryptography]
- passlib[bcrypt]
- python-multipart

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request
