# AquaMind

AquaMind is a hydration tracker with a React frontend and a Flask API backend.

## Stack

- Frontend: React + Vite (in `aquamind/client`)
- Backend: Flask + SQLAlchemy + Marshmallow + Flask-JWT-Extended (in `server`)
- Database migrations: Flask-Migrate / Alembic

## Local Setup

### 1) Backend

From `server/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Set env vars (PowerShell example):

```powershell
$env:FLASK_APP="app.py"
$env:JWT_SECRET_KEY="change-me"
# Optional (defaults to sqlite:///aquamind.db)
$env:DATABASE_URL="sqlite:///aquamind.db"
```

Run migrations and seed:

```bash
flask db upgrade
python seed.py
```

Start API:

```bash
python app.py
```

### 2) Frontend

From `aquamind/client/`:

```bash
npm install
```

Create `.env` with:

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

Run app:

```bash
npm run dev
```

## API Routes

All routes are prefixed with `/api`.

### Auth + Users

- `POST /users/register`
- `POST /users/login`
- `GET /users/me` (JWT required)
- `GET /users?page=1&per_page=10` (JWT + admin)
- `DELETE /users/<id>` (JWT + admin)

### Water Logs

- `GET /logs?page=1&per_page=10` (JWT)
- `POST /logs` (JWT)
- `PUT /logs/<id>` (JWT)
- `DELETE /logs/<id>` (JWT)
- `GET /logs/summary` (JWT, aggregation)

### Goals

- `GET /goals?page=1&per_page=10` (JWT)
- `POST /goals` (JWT)
- `PUT /goals/<id>` (JWT)
- `DELETE /goals` (JWT)
- `GET /goals/stats` (JWT, aggregation)

### Reminders

- `GET /reminders?page=1&per_page=10` (JWT)
- `POST /reminders` (JWT)

### Activities

- `GET /activities?page=1&per_page=10` (JWT)
- `POST /activities` (JWT)

### Courses + Enrollments

- `GET /courses?page=1&per_page=10` (JWT, join + aggregation)
- `POST /courses` (JWT + admin)
- `POST /courses/enroll` (JWT)
- `GET /courses/enrollments?page=1&per_page=10` (JWT)
- `GET /courses/enrollment-stats` (JWT, join + filter + aggregation)

## Data Model Highlights

- 1:1: `users` ↔ `profiles`
- 1:many: `users` → `water_logs` / `goals` / `activities` / `reminders`
- many:many: `users` ↔ `courses` via `enrollments`
- Extra association attributes: `enrollments.grade`, `enrollments.enrolled_at`

## Security Notes

- `.env` is git-ignored.
- API error messages are generic for auth failures and do not expose account identifiers.
