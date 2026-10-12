@echo off
echo ========================================================
echo   Starting EduInsight Application
echo ========================================================
echo.
echo Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "EduInsight Backend" cmd /k "cd backend && py -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend (Vite on http://localhost:5173)...
start "EduInsight Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
pause
