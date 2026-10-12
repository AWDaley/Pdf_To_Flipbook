@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24.13.0, then open this launcher again.
  pause
  exit /b 1
)
if not exist "node_modules\tsx\package.json" (
  echo First run npm ci from this folder. See README.md.
  pause
  exit /b 1
)
call npm.cmd run build
if errorlevel 1 (
  pause
  exit /b 1
)
node scripts\launch.mjs
if errorlevel 1 pause
