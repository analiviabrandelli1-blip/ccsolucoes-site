@echo off
cd /d "%~dp0"
if not exist data\server.pid (
  echo O painel nao parece estar rodando.
  pause
  exit /b
)
set /p PID=<data\server.pid
taskkill /PID %PID% /F >nul 2>&1
del data\server.pid >nul 2>&1
echo Painel encerrado.
pause
