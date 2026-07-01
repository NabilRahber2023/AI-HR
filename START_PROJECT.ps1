# HR AI Platform - Complete Startup Script
# Starts the FastAPI backend and Next.js frontend (database is local SQLite).

Write-Host "HR AI Platform - Startup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Function to check if a port is accepting connections
function Test-Port {
    param($Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("127.0.0.1", $Port)
        $tcpClient.Close()
        return $true
    } catch {
        return $false
    }
}

# Step 1: Seed the database (creates SQLite file, demo users, and loads sample data)
Write-Host "Seeding database (SQLite)..." -ForegroundColor Yellow
Set-Location $projectRoot
& .\venv\Scripts\python.exe seed.py
Write-Host "   Database ready" -ForegroundColor Green

# Step 2: Start FastAPI Backend
Write-Host "Starting FastAPI Backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($projectRoot)
    Set-Location $projectRoot
    & .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
} -ArgumentList $projectRoot

Write-Host "   Backend started in background job (PID: $($backendJob.Id))" -ForegroundColor Gray
Write-Host "   Waiting for backend to be ready..." -ForegroundColor Gray

$maxWait = 30
$waited = 0
while ($waited -lt $maxWait) {
    if (Test-Port 8000) {
        Write-Host "   Backend ready at http://localhost:8000" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
    $waited++
    Write-Host -NoNewline "."
}
Write-Host ""

# Step 3: Start Next.js Frontend
Write-Host "Starting Next.js Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($projectRoot)
    Set-Location "$projectRoot\frontend"
    npm run dev
} -ArgumentList $projectRoot

Write-Host "   Frontend started in background job (PID: $($frontendJob.Id))" -ForegroundColor Gray
Write-Host "   Waiting for frontend to be ready..." -ForegroundColor Gray

$maxWait = 60
$waited = 0
while ($waited -lt $maxWait) {
    if (Test-Port 3000) {
        Write-Host "   Frontend ready at http://localhost:3000" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
    $waited++
    Write-Host -NoNewline "."
}
Write-Host ""

Write-Host ""
Write-Host "All services are running!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "   Landing/App:   http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API:   http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:      http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Admin:  admin@company.com / admin123" -ForegroundColor White
Write-Host "   User:   user@company.com / user123" -ForegroundColor White
Write-Host ""
Write-Host "Running Jobs:" -ForegroundColor Cyan
Write-Host "   Backend Job ID: $($backendJob.Id)" -ForegroundColor Gray
Write-Host "   Frontend Job ID: $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop services, close this window or run:" -ForegroundColor Gray
Write-Host "   Stop-Job -Id $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""

# Keep script running and monitor jobs
Write-Host "Monitoring services... (Press Ctrl+C to stop)" -ForegroundColor Gray
try {
    while ($true) {
        Start-Sleep -Seconds 5
        if ($backendJob.State -ne "Running") {
            Write-Host "Backend job stopped!" -ForegroundColor Red
        }
        if ($frontendJob.State -ne "Running") {
            Write-Host "Frontend job stopped!" -ForegroundColor Red
        }
    }
} finally {
    Write-Host ""
    Write-Host "Stopping services..." -ForegroundColor Yellow
    Stop-Job -Id $backendJob.Id, $frontendJob.Id
    Remove-Job -Id $backendJob.Id, $frontendJob.Id
    Write-Host "Services stopped" -ForegroundColor Green
}
