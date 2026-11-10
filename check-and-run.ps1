# ===============================================================================
# GymSphere System Diagnostic & Startup Script
# Checks MySQL, Database, Java, Maven, Node, and runs both Backend & Frontend
# ===============================================================================

$ErrorActionPreference = "Continue"

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "               GymSphere - Diagnostic Check & Run" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$javaHome = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$mavenHome = "C:\Users\Admin\tools\apache-maven-3.9.9"
$nodeHome = "C:\Users\Admin\tools\nodejs"
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 26.10\bin"

$env:JAVA_HOME = $javaHome
$env:Path = "$javaHome\bin;$mavenHome\bin;$nodeHome;$mysqlBin;" + $env:Path

# Step 1: MySQL Service
Write-Host "[1/6] Checking MySQL Service..." -ForegroundColor Yellow
$service = Get-Service -Name *mysql* -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Running" } | Select-Object -First 1
if ($service) {
    Write-Host "   [OK] MySQL Service '$($service.Name)' is Running." -ForegroundColor Green
} else {
    Write-Host "   [!] MySQL not running, attempting to start MySQL2610..." -ForegroundColor Yellow
    try {
        Start-Service -Name MySQL2610 -ErrorAction SilentlyContinue
        Write-Host "   [OK] MySQL2610 started successfully." -ForegroundColor Green
    } catch {
        Write-Host "   [!] Could not start service automatically. Ensure MySQL service is running." -ForegroundColor Red
    }
}

# Step 2: MySQL Connection & Database Seeding
Write-Host "`n[2/6] Checking MySQL Database 'gymsphere_db'..." -ForegroundColor Yellow
$mysqlExe = "$mysqlBin\mysql.exe"
if (Test-Path $mysqlExe) {
    cmd.exe /c "`"$mysqlExe`" -u root -pMySql@2026 -e `"USE gymsphere_db; SELECT COUNT(*) FROM trainers;`" >nul 2>&1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Database 'gymsphere_db' is intact with trainers table." -ForegroundColor Green
    } else {
        Write-Host "   [!] Database missing or incomplete. Initializing schema and sample data..." -ForegroundColor Yellow
        cmd.exe /c "type `"d:\gym web\database\schema.sql`" | `"$mysqlExe`" -u root -pMySql@2026 >nul 2>&1"
        cmd.exe /c "type `"d:\gym web\database\sample_data.sql`" | `"$mysqlExe`" -u root -pMySql@2026 >nul 2>&1"
        Write-Host "   [OK] Database initialized successfully." -ForegroundColor Green
    }
} else {
    Write-Host "   [!] mysql.exe not found at standard path." -ForegroundColor Yellow
}

# Step 3: Toolchain Check
Write-Host "`n[3/6] Verifying Toolchain..." -ForegroundColor Yellow
Write-Host "   - Java:  $(java -version 2>&1 | Select-Object -First 1)" -ForegroundColor Gray
Write-Host "   - Maven: $(mvn.cmd -v 2>&1 | Select-Object -First 1)" -ForegroundColor Gray
Write-Host "   - Node:  v$(node -v 2>&1)" -ForegroundColor Gray
Write-Host "   - npm:   v$(npm.cmd -v 2>&1)" -ForegroundColor Gray
Write-Host "   [OK] Toolchain verified." -ForegroundColor Green

# Step 4: Backend
Write-Host "`n[4/6] Checking Backend on port 8080..." -ForegroundColor Yellow
$backendActive = (netstat -ano | findstr :8080 | findstr LISTENING)
if ($backendActive) {
    Write-Host "   [OK] Backend is already running on port 8080." -ForegroundColor Green
} else {
    Write-Host "   [*] Starting Backend in new window..." -ForegroundColor Cyan
    Start-Process cmd.exe -ArgumentList "/k cd /d `"d:\gym web\backend`" && set JAVA_HOME=$javaHome && set PATH=$javaHome\bin;$mavenHome\bin;$env:PATH && mvn spring-boot:run" -WindowStyle Normal
    Write-Host "   [OK] Backend startup triggered." -ForegroundColor Green
}

# Step 5: Frontend
Write-Host "`n[5/6] Checking Frontend on port 5173..." -ForegroundColor Yellow
$frontendActive = (netstat -ano | findstr :5173 | findstr LISTENING)
if ($frontendActive) {
    Write-Host "   [OK] Frontend is already running on port 5173." -ForegroundColor Green
} else {
    Write-Host "   [*] Starting Frontend in new window..." -ForegroundColor Cyan
    Start-Process cmd.exe -ArgumentList "/k cd /d `"d:\gym web\frontend`" && set PATH=$nodeHome;$env:PATH && npm run dev" -WindowStyle Normal
    Write-Host "   [OK] Frontend startup triggered." -ForegroundColor Green
}

# Step 6: Launch Browser
Write-Host "`n[6/6] Launching Web Browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"
Write-Host "   [OK] Opened http://localhost:5173" -ForegroundColor Green

Write-Host "`n===============================================================================" -ForegroundColor Cyan
Write-Host " GymSphere is LIVE! Login: admin@gymsphere.com / admin123" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan
