@echo off
REM HR AI Platform - Quick Start Batch File (Windows)
REM Database is local SQLite (no Docker/PostgreSQL required).

title HR AI Platform - Starting Services...
echo.
echo ===============================================
echo    HR AI Platform - Quick Start
echo ===============================================
echo.

REM Seed database (creates SQLite file, demo users, sample data)
echo [1/3] Seeding database (SQLite)...
call venv\Scripts\python.exe seed.py
echo.

REM Start Backend
echo [2/3] Starting FastAPI Backend (port 8000)...
echo       Opening in new window...
start "HR AI Backend" cmd /k "cd /d %~dp0 && venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 5 /nobreak >nul

REM Start Frontend
echo.
echo [3/3] Starting Next.js Frontend (port 3000)...
echo       Opening in new window...
start "HR AI Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ===============================================
echo    Services Starting...
echo ===============================================
echo.
echo Frontend:   http://localhost:3000
echo Backend:    http://localhost:8000
echo API Docs:   http://localhost:8000/docs
echo.
echo Admin:      admin@company.com / admin123
echo User:       user@company.com / user123
echo.
echo New terminal windows have been opened for each service.
echo Close them to stop the services.
echo.
pause
