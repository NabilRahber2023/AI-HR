# 🤖 AI-Powered Employee Performance & Potential Management
## 9-Box Grid Framework — Full-Stack AI Platform

> **Portfolio-grade enterprise HR analytics platform** with ML prediction, AI recommendations, and a conversational chatbot.

Runs fully locally with **SQLite** (zero database setup). Optional **Ollama** powers live AI chat, with graceful fallbacks when it's offline.

---

## 🌐 Live Demo

| | URL |
|---|---|
| **App (frontend)** | https://hr-ai-frontend-tan.vercel.app |
| **API (backend)** | https://hr-ai-backend-xd95.onrender.com |
| **API docs** | https://hr-ai-backend-xd95.onrender.com/docs |

**Demo login:** `admin@company.com / admin123` (admin) · `user@company.com / user123` (user)

Hosted as **Frontend → Vercel**, **Backend → Render**, **Database → Neon Postgres**.
See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full cloud setup. Two free-tier notes:
the Render backend sleeps after ~15 min idle (first request wakes it in ~50 s), and the
chatbot uses its rule-based fallback in the cloud (Ollama runs locally only).

---

## ⚡ TL;DR — Run It

```powershell
# 1) Backend deps (Python 3.11+)
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# 2) Frontend deps (Node 18+)
cd frontend; npm install; cd ..

# 3) Seed DB (SQLite file + demo users + sample data) and launch everything
.\START_PROJECT.ps1
```

Then open **http://localhost:3000** and log in with `admin@company.com / admin123`.

---

## 📋 TECH STACK

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy |
| **Database** | SQLite (default, zero-config) · PostgreSQL optional |
| **ML** | Scikit-learn, RandomForestClassifier |
| **AI/LLM** | Ollama (default `phi3:mini`; any pulled model works) |
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Recharts, Zustand |
| **Auth** | JWT + bcrypt |
| **Hosting** | Vercel (frontend) · Render (backend) · Neon Postgres (DB) — see [DEPLOYMENT.md](DEPLOYMENT.md) |

---

## 📁 PROJECT STRUCTURE

```
hr-ai-platform/
├── app/                        # FastAPI backend
│   ├── main.py                 # App entry point
│   ├── config.py               # Settings
│   ├── dependencies.py         # JWT auth middleware
│   ├── auth/                   # Authentication
│   ├── users/                  # User management + DB models
│   ├── employees/              # Employee CRUD, CSV upload, validators
│   ├── analytics/              # HR analytics endpoints
│   ├── ml/                     # ML training + label prediction
│   ├── recommendation/         # AI recommendation engine
│   ├── chatbot/                # Ollama chatbot (with streaming)
│   ├── database/               # DB session + base
│   └── synthetic_data/         # Dataset generator + scoring engine
├── frontend/                   # Next.js frontend
│   └── src/
│       ├── app/                # App Router pages (landing, login, admin/*, dashboard, chatbot)
│       ├── components/         # Shared + landing-page components
│       ├── lib/                # Axios API layer
│       └── store/              # Zustand auth store
├── models/                     # Saved ML model (.pkl)
├── data/                       # Sample CSV datasets (22 raw columns, no labels)
├── tests/                      # Pytest test suite
├── seed.py                     # Creates demo users + loads sample data
├── requirements.txt            # Python dependencies
└── .env.example                # Environment template
```

---

## ⚙️ SETUP STEPS

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.ai) (optional, for live AI chat)

### STEP 1 — Backend
```powershell
python -m venv venv
.\venv\Scripts\activate          # Windows  (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
```

### STEP 2 — Environment Variables
```powershell
copy .env.example .env           # Windows (Mac/Linux: cp .env.example .env)
```
The defaults work out of the box (SQLite + `phi3:mini`). Edit `.env` only if you
want PostgreSQL or a different Ollama model.

### STEP 3 — Seed the database
```powershell
# Creates the SQLite file, the two demo users, and loads sample employees.
.\venv\Scripts\python.exe seed.py
```

### STEP 4 — Start Backend
```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
> ✅ Backend: http://localhost:8000 · API Docs: http://localhost:8000/docs

### STEP 5 — Start Frontend
```powershell
cd frontend
npm install
npm run dev
```
> ✅ App (landing + login): http://localhost:3000

### STEP 6 — Train the ML Model
Log in as admin → **ML Prediction** → **Train Model** (or `POST /prediction/train`).

### STEP 7 — (Optional) Ollama for live chat
```powershell
ollama pull phi3:mini
ollama serve
```

> 💡 Steps 3–5 are automated by `.\START_PROJECT.ps1` (or `START_PROJECT.bat`).

---

## 📤 CSV UPLOAD — REQUIRED COLUMNS

Uploaded CSVs must contain **only these 22 raw attributes** (order doesn't matter):

```
worker_id, employee_name, employee_email, age, gender, department, job_role,
join_date, years_of_experience, monthly_salary_usd, avg_monthly_attendance_percent,
late_arrival_count, absent_days_last_6_months, overtime_hours_monthly, kpi_score,
goal_completion_percent, task_completion_rate, manager_feedback_score, training_hours,
certifications_count, skill_assessment_score, leadership_assessment_score
```

> ⚙️ **The system predicts the labels.** `performance_level`, `potential_level`,
> and `nine_box` are **NOT** part of the upload — on upload the AI predicts all
> three for every record, saves them, and treats them as the source of truth for
> every dashboard, recommendation, and report. (If a CSV still includes those
> columns, they are ignored and re-predicted.) Sample files: `data/sample_upload.csv`,
> `data/synthetic_employees.csv`, `data/synthetic_employees_10k.csv`.

---

## 📡 API ENDPOINTS

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create new account |
| POST | `/auth/login` | Login, get JWT token |
| GET | `/auth/me` | Get current user |

### Employees
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/employees/upload-csv` | Upload raw CSV → predicts + stores labels | Admin |
| GET | `/employees` | List employees | Admin |
| GET | `/employees/{id}` | Get employee by ID | Any |
| GET | `/employees/search?q=` | Search by name/ID | Any |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary` | Summary stats |
| GET | `/analytics/salary-distribution` | Adaptive salary histogram |
| GET | `/analytics/department-performance` | Dept KPIs (ranked) |
| GET | `/analytics/9box-distribution` | 9-box counts |
| GET | `/analytics/gender-distribution` | Gender split |
| GET | `/analytics/performance-distribution` | Performance level counts |

### ML & Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/prediction/train` | Train model |
| GET | `/prediction/employee/{id}` | Predict labels for an employee |
| POST | `/prediction/custom` | Predict labels for custom input |
| GET | `/prediction/metrics` | Latest model metrics |

### Recommendations & Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendation/{id}` | Get recommendations |
| POST | `/chat/chat` | Chat with AI (buffered) |
| POST | `/chat/stream` | Chat with AI (token streaming) |
| GET | `/chat/history` | Chat history |

---

## 🎯 9-BOX GRID FRAMEWORK

```
HIGH    │ Box 7          │ Box 8          │ Box 9          │
POTEN.  │ Emerging Talent│ Future Leader  │ Star Performer │
        ├────────────────┼────────────────┼────────────────┤
MEDIUM  │ Box 4          │ Box 5          │ Box 6          │
POTEN.  │ Inconsistent   │ Core Contrib.  │ High Performer │
        ├────────────────┼────────────────┼────────────────┤
LOW     │ Box 1          │ Box 2          │ Box 3          │
POTEN.  │ Underperformer │ Solid/Limited  │ Trusted Pro    │
        └────────────────┴────────────────┴────────────────┘
             LOW PERF        MEDIUM PERF      HIGH PERF
```

### Performance Score Formula
```
performance = 0.30×KPI + 0.25×goal + 0.20×task + 0.15×feedback + 0.10×attendance
            - (late_arrivals × 0.8) - (absent_days × 1.5)
```

### Potential Score Formula
```
potential = 0.25×skill + 0.25×leadership + 0.20×training_norm
          + 0.15×cert_norm + 0.15×experience_norm
```

These domain scores are also used as engineered features by the ML model.

---

## 🤖 AI FEATURES

### ML Model (predicts the labels)
- **Inputs:** the 18 numeric/categorical raw metrics **+ 2 engineered domain scores**
- **Targets:** `performance_level` and `potential_level` (two RandomForest classifiers, 300 trees each); `nine_box` is derived from the predicted levels
- **Ground truth for training:** the domain scoring engine (non-circular, so training stays honest even after model-labeled uploads)
- **Cold start:** before the model is trained, uploads are labeled by the scoring engine so nothing breaks
- **Metrics:** Accuracy, Precision, Recall, F1, Confusion Matrix, plus per-level accuracy (typically 95–99%, scaling with dataset size)

### Recommendation Engine
- Rule-based strategies per box (10 recommendations)
- AI-enhanced via Ollama (personalized additions), graceful fallback when offline

### Chatbot
- Powered by Ollama (`phi3:mini` by default), HR-specialized system prompt
- Token streaming endpoint for responsive replies; smart rule-based fallback when offline
- Conversation history is persisted and can be reloaded in-app via the **History** button
- The Employee Predictive Analysis page also has an embedded chat that answers questions about the simulated profile

---

## 🖥️ FRONTEND PAGES

| Page | Route | Access |
|------|-------|--------|
| Landing | `/` | Public |
| Login | `/login` | Public |
| Signup | `/signup` | Public |
| Admin Dashboard | `/admin` | Admin |
| Upload CSV | `/admin/upload` | Admin |
| Employees List | `/admin/employees` | Admin |
| Employee Search | `/admin/search` | Admin |
| ML Prediction | `/admin/prediction` | Admin |
| Model Metrics | `/admin/metrics` | Admin |
| AI Chatbot (Admin) | `/admin/chatbot` | Admin |
| User Dashboard | `/dashboard` | User |
| AI Chatbot (User) | `/chatbot` | User |

> **Responsive across breakpoints.** On desktop the sidebar is fixed; on tablet/mobile
> it collapses into a slide-in drawer opened from the top-bar menu (with a tap-to-close
> backdrop). A floating shortcut to the AI assistant is available on every signed-in page.

---

## 🔐 SECURITY FEATURES

- JWT access tokens (configurable expiry)
- bcrypt password hashing
- Role-based access control (Admin / User)
- CORS protection
- SQL-injection prevention via SQLAlchemy ORM
- Environment-based secrets

---

## 🧪 RUNNING TESTS

```powershell
pytest tests/ -v
```

---

## 🐛 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| `CSV validation error` | Use the 22 raw columns only (see CSV section); try `data/sample_upload.csv` |
| `Not enough data to train` | Upload a dataset first, then train |
| `Ollama unavailable` | Run `ollama serve`; chatbot/recommendations fall back gracefully |
| `CORS error` | Ensure `FRONTEND_URL` in `.env` matches the frontend origin (`http://localhost:3000`) |
| `JWT expired` | Re-login to get a fresh token |
| Reset DB | Delete `hr_ai_platform.db` and run `python seed.py` |
| `npm install fails` | Use Node.js 18+ (`node --version`) |

---

## 🏗️ ARCHITECTURE

```
┌─────────────┐     HTTP/REST      ┌──────────────────┐
│  Next.js    │◄──────────────────►│   FastAPI        │
│  Frontend   │   JWT Auth         │   Backend        │
│  Port 3000  │                    │   Port 8000      │
└─────────────┘                    └────────┬─────────┘
                                            │
                              ┌─────────────┼──────────────┐
                              │             │              │
                    ┌─────────▼──┐  ┌───────▼──┐  ┌────────▼──┐
                    │  SQLite    │  │ Scikit   │  │  Ollama   │
                    │  Database  │  │  Learn   │  │  LLM      │
                    │ (file)     │  │  Models  │  │ Port 11434│
                    └────────────┘  └──────────┘  └───────────┘
```

---

## 👤 DEMO ACCOUNTS

Seeded automatically by `seed.py`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| User | user@company.com | user123 |

---

## 📄 LICENSE

MIT License — Free for portfolio and commercial use.

---

**Built with ❤️ as a production-grade AI portfolio project.**
