# Aquamind

Aquamind is a hydration and wellness app with a React/Vite frontend and a Python backend.

## Repository layout

- `client/` – React + Vite frontend
- `main.py` – Python backend entrypoint
- `controllers/`, `models/`, `schemas/` – backend app layers
- `migrations/` – Alembic database migrations
- `requirements.txt` – Python dependencies
- `package.json` – root Node workspace for frontend deployment
- `vercel.json` – Vercel configuration for frontend build
- `.gitignore` – repository ignore rules

## Local development

1. Install backend dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

4. Start the backend:

```bash
python main.py
```

## Vercel deployment

This repo is configured as a Node workspace so Vercel can detect the frontend build.

Use these commands in the root folder:

```bash
npm install
npm run build
```

Vercel will build the app from `client/` and serve the static output from `client/dist`.

## Notes

- Keep the backend separate from Vercel static deployments unless you add serverless API routes.
- The frontend lives in `client/` and is the folder Vercel should deploy.
