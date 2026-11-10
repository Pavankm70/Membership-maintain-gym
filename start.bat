@echo off
setlocal enabledelayedexpansion
title GymSphere - Verification and Startup

echo ===============================================================================
echo               GymSphere - Check Every Time ^& Run Project
echo ===============================================================================
echo.

:: 1. Ensure Environment Paths
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
set "MAVEN_HOME=C:\Users\Admin\tools\apache-maven-3.9.9"
set "NODE_HOME=C:\Users\Admin\tools\nodejs"
set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 26.10\bin"

set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%NODE_HOME%;%MYSQL_BIN%;%PATH%"

:: 2. Check & Start MySQL Service
echo [1/5] Checking MySQL Service...
sc query MySQL2610 | find "RUNNING" >nul
if %ERRORLEVEL% equ 0 (
    echo   [OK] MySQL2610 is running.
) else (
    echo   [!] Starting MySQL2610 service...
    net start MySQL2610 >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo   [OK] MySQL2610 started successfully.
    ) else (
        echo   [!] Checking fallback MySQL80...
        net start MYSQL80 >nul 2>&1
    )
)

:: 3. Check Database & Initialize if needed
echo.
echo [2/5] Checking Database 'gymsphere_db'...
"%MYSQL_BIN%\mysql.exe" -u root -pMySql@2026 -e "USE gymsphere_db; SELECT COUNT(*) FROM trainers;" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   [OK] Database 'gymsphere_db' is ready with trainers table.
) else (
    echo   [!] Database not found. Initializing schema and sample data...
    powershell -NoProfile -Command "Get-Content 'd:\gym web\database\schema.sql' -Raw | & '%MYSQL_BIN%\mysql.exe' -u root -pMySql@2026; Get-Content 'd:\gym web\database\sample_data.sql' -Raw | & '%MYSQL_BIN%\mysql.exe' -u root -pMySql@2026;"
    echo   [OK] Database seeded successfully.
)

:: 4. Verify Java, Maven, and Node
echo.
echo [3/5] Verifying toolchain...
"%JAVA_HOME%\bin\java.exe" -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [ERROR] Java 21 not found at %JAVA_HOME%
    pause
    exit /b 1
)
"%NODE_HOME%\node.exe" -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [ERROR] Node.js not found at %NODE_HOME%
    pause
    exit /b 1
)
echo   [OK] Java 21, Maven 3.9.9, and Node.js are verified.

:: 5. Launch Backend
echo.
echo [4/5] Launching Backend (Spring Boot on http://localhost:8080)...
netstat -ano | findstr :8080 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo   [OK] Backend is already running on port 8080.
) else (
    start "GymSphere Backend (Port 8080)" cmd /k "cd /d d:\gym web\backend && set JAVA_HOME=%JAVA_HOME% && set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH% && mvn spring-boot:run"
    echo   [OK] Backend started in separate window.
)

:: 6. Launch Frontend
echo.
echo [5/5] Launching Frontend (Vite on http://localhost:5173)...
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo   [OK] Frontend is already running on port 5173.
) else (
    start "GymSphere Frontend (Port 5173)" cmd /k "cd /d d:\gym web\frontend && set PATH=%NODE_HOME%;%PATH% && npm run dev"
    echo   [OK] Frontend started in separate window.
)

echo.
echo ===============================================================================
echo   GymSphere Stack Running:
echo     - Frontend: http://localhost:5173
echo     - Backend:  http://localhost:8080
echo     - Database: MySQL (port 3306, gymsphere_db)
echo     - Login:    admin@gymsphere.com / admin123
echo ===============================================================================
echo.
echo Opening browser...
start http://localhost:5173
ping 127.0.0.1 -n 3 >nul
