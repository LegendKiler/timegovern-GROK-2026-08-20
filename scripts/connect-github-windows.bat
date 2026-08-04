@echo off
title TimeGovern.com - GitHub & Cloudflare Auto Sync
echo ===================================================
echo   TimeGovern.com - Master Repository Automation
echo ===================================================
echo.

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not found in PATH.
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [1/4] Initializing Git repository...
git init

echo [2/4] Setting remote repository origin...
git remote remove origin 2>nul
git remote add origin https://github.com/LegendKiler/timegovern-website.git

echo [3/4] Staging and committing project files...
git branch -M main
git add .
git commit -m "Master Deploy: Fully automated Cloudflare Workers + D1 Database + Custom Domain pipeline"

echo [4/4] Pushing code to GitHub main branch...
git push -u origin main --force

echo.
echo ===================================================
echo  SUCCESS! Code pushed to GitHub.
echo  GitHub Actions will now automatically:
echo  1. Delete legacy 'timegovern-site2' worker
echo  2. Apply D1 Database migrations ('zoneshift-db')
echo  3. Deploy 'timegovern-website' to Cloudflare
echo ===================================================
pause
