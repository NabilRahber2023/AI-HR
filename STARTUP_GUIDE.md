# 🚀 HR AI Platform - Quick Start Guide

The platform runs fully locally with **SQLite** (no Docker or PostgreSQL required).
The only optional external piece is **Ollama** for live AI chat — the app falls
back to curated responses when it's not running.

## One-Command Startup

### Option 1: PowerShell Script (Recommended) ⭐
```powershell
# From the project root
.\START_PROJECT.ps1
```
Seeds the database, then starts the FastAPI backend (port 8000) and the
Next.js frontend (port 3000), and monitors both.

### Option 2: Batch File
```cmd
REM Double-click START_PROJECT.bat, or from a terminal:
START_PROJECT.bat
```
Seeds the database and opens a separate window for each service.

---

## ⚡ Quick Reference

```
🌐 App (landing + login): http://localhost:3000
📡 Backend:                http://localhost:8000
📖 API Docs:               http://localhost:8000/docs
```

### Demo Credentials
```
Admin:  admin@company.com / admin123
User:   user@company.com / user123
```

---

## 🔧 Manual Setup (If Needed)

### 0. One-time: install dependencies
```powershell
# Backend (Python 3.11+)
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Frontend (Node 18+)
cd frontend
npm install
cd ..
```

### 1. Seed the database (creates SQLite file + demo users + sample data)
```powershell
.\venv\Scripts\python.exe seed.py
```

### 2. Backend
```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend
```powershell
cd frontend
npm run dev
```

### 4. (Optional) Ollama for live AI chat
```powershell
ollama pull phi3:mini   # or any model set in .env (OLLAMA_MODEL)
ollama serve
```

---

## 📤 Uploading Your Own Data

Upload a CSV with the **22 raw columns only** (see the Upload page for the list).
The three talent labels — `performance_level`, `potential_level`, and `nine_box`
— are **not** included in the CSV; the system predicts and stores them
automatically. Sample files live in `data/` (`sample_upload.csv`,
`synthetic_employees.csv`, `synthetic_employees_10k.csv`).

---

## ❓ Troubleshooting

### Ports already in use
```powershell
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwnerProcess
Get-Process -Id <PID> | Stop-Process
```

### Backend won't start
```powershell
pip install --upgrade -r requirements.txt
```

### Frontend won't start
```powershell
cd frontend
npm install
npm run dev
```

### Reset the database
```powershell
# Delete the SQLite file and re-seed
Remove-Item .\hr_ai_platform.db -ErrorAction SilentlyContinue
.\venv\Scripts\python.exe seed.py
```

### Chatbot replies are generic
That's the graceful fallback — start Ollama (`ollama serve`) and make sure
`OLLAMA_MODEL` in `.env` matches a model you've pulled.

---

## 📊 Service Status Check
```powershell
curl http://localhost:8000/health      # Backend
curl http://localhost:3000             # Frontend
```
