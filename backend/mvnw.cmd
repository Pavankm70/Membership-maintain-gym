@REM ----------------------------------------------------------------------------
@REM GymSphere Maven Wrapper script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set "MAVEN_CMD=%USERPROFILE%\tools\apache-maven-3.9.9\bin\mvn.cmd"
if exist "%MAVEN_CMD%" (
    call "%MAVEN_CMD%" %*
    exit /b %ERRORLEVEL%
)

where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    call mvn %*
    exit /b %ERRORLEVEL%
)

echo [ERROR] Maven not found. Please install Apache Maven or place it in %USERPROFILE%\tools\apache-maven-3.9.9\
exit /b 1
