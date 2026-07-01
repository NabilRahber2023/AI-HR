# 🚀 Cloud Deployment Guide

The project is deployed as three managed services (all have free tiers):

```
┌────────────────────┐      HTTPS / JWT       ┌────────────────────┐      SQL       ┌──────────────┐
│  Next.js frontend  │ ─────────────────────► │  FastAPI + ML API  │ ─────────────► │  Neon        │
│  Vercel            │   NEXT_PUBLIC_API_URL   │  Render            │   DATABASE_URL │  Postgres    │
└────────────────────┘                        └────────────────────┘                └──────────────┘
```

**Why split hosting?** Vercel serverless functions have a 250 MB limit; the ML stack
(scikit-learn + scipy + pandas + numpy ≈ 300 MB) exceeds it, so the FastAPI backend runs
on Render (a Python-friendly host) while the Next.js frontend runs on Vercel.

**Live URLs**
- Frontend: https://hr-ai-frontend-tan.vercel.app
- Backend: https://hr-ai-backend-xd95.onrender.com (`/health`, `/docs`)

---

## 1. Database — Neon Postgres

1. Create a project at https://neon.tech and copy the connection string:
   `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`
2. Initialize tables + demo data (run once, locally, with the Neon URL):
   ```powershell
   $env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
   .\venv\Scripts\python.exe seed.py
   ```
   This creates the schema and seeds the two demo users + sample employees.

> The app also auto-creates tables on startup (`Base.metadata.create_all`), so seeding is
> only needed to preload demo data.

---

## 2. Backend — Render (FastAPI + ML)

Blueprint config lives in **[`render.yaml`](render.yaml)**. Deploy either way:

**A. Dashboard (Blueprint)** — Render → *New → Blueprint* → connect the GitHub repo →
it reads `render.yaml` and creates the `hr-ai-backend` web service.

**B. Render API** — `POST https://api.render.com/v1/services` with the repo, branch, and the
env vars below (see `render.yaml` for build/start commands).

**Build / start**
```
build:  pip install -r requirements.txt
start:  uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Environment variables (set in Render)**
| Key | Value |
|---|---|
| `DATABASE_URL` | your Neon connection string |
| `SECRET_KEY` | a long random string (JWT signing) |
| `FRONTEND_URL` | the Vercel frontend URL (for CORS), e.g. `https://hr-ai-frontend-tan.vercel.app` |
| `PYTHON_VERSION` | `3.12.7` |

---

## 3. Frontend — Vercel (Next.js)

Root directory is `frontend/`. Deploy via the dashboard (import the repo, set **Root Directory
= `frontend`**) or the CLI:

```bash
npm i -g vercel
cd frontend
vercel link --project hr-ai-frontend
vercel env add NEXT_PUBLIC_API_URL production   # value: the Render backend URL
vercel deploy --prod
```

**Environment variable (set in Vercel)**
| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | the Render backend URL, e.g. `https://hr-ai-backend-xd95.onrender.com` |

> `NEXT_PUBLIC_*` vars are inlined at **build time**, so change it → redeploy.
> Ensure **Deployment Protection** is off (Vercel → project → Settings → Deployment Protection)
> if the app should be publicly accessible.

---

## 4. What runs in the cloud (and what falls back)

| Feature | Cloud behavior |
|---|---|
| Auth, dashboards, analytics, employees, search, **CSV upload**, recommendations, model metrics | ✅ Fully working |
| **ML prediction** | ✅ Works. The trained `.pkl` is not committed (git-ignored), so predictions use the deterministic **scoring engine** (identical 9-box results). Clicking **Train Model** trains within a warm instance; the artifact lives in `/tmp` and is re-created after a restart. |
| **AI Chatbot** | ⚠️ Works via the **rule-based fallback**. The live LLM (Ollama) is a local model server and does not run on Render. To enable cloud AI, point the chatbot at a hosted LLM API. |

---

## 5. Free-tier notes

- **Render free** sleeps after ~15 min of inactivity; the next request cold-starts in ~50 s.
  Keep it warm by pinging `/health` on a schedule (e.g. cron-job.org), or upgrade to the
  always-on Starter plan.
- **Neon free** compute may auto-suspend and resumes automatically on the next query.

---

## 6. Redeploying after code changes

- **Backend:** push to the deployed branch → Render redeploys (or trigger `POST
  /v1/services/{id}/deploys`).
- **Frontend:** `vercel deploy --prod` (or a push, if the Git integration is connected).

---

## 7. Serverless compatibility built into the code

These make the app portable across local/SQLite and cloud/Postgres (see `app/config.py`,
`app/database/session.py`, `app/main.py`, `app/ml/trainer.py`):

- `DATABASE_URL` defaults to SQLite (never a localhost Postgres), and is read from the
  environment in production.
- `postgres://` URLs are normalized to `postgresql://`; Postgres uses `NullPool`
  (serverless-friendly); SQLite relocates to `/tmp` on read-only hosts.
- Startup `create_all()` is best-effort so a cold start never crashes.
- The ML model artifact is written to a writable directory (`/tmp` on read-only hosts).
- `bcrypt` is pinned to `4.0.1` for `passlib` 1.7.4 compatibility.
