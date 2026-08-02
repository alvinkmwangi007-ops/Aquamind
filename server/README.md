# AquaMind Server

This directory contains the Flask backend for AquaMind.

## Setup

1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and update secrets.

3. Initialize the database:

```bash
set FLASK_APP=app.py
flask db init
flask db migrate -m "Initial schema"
flask db upgrade
```

4. Seed sample data:

```bash
python seed.py
```

## API Endpoints

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/me`
- `GET /api/users?page=1&per_page=10`
- `DELETE /api/users/<id>` (admin only)
- `GET /api/logs?page=1&per_page=10`
- `POST /api/logs`
- `PUT /api/logs/<id>`
- `DELETE /api/logs/<id>`
- `GET /api/logs/summary`
- `GET /api/goals?page=1&per_page=10`
- `POST /api/goals`
- `GET /api/reminders?page=1&per_page=10`
- `POST /api/reminders`
- `GET /api/activities?page=1&per_page=10`
- `POST /api/activities`
- `GET /api/courses`
- `POST /api/courses` (admin only)
- `POST /api/courses/enroll`
- `GET /api/courses/enrollments`
