#!/bin/bash
set -e

echo "==================================================="
echo "  TimeGovern.com - Master Repository Automation"
echo "==================================================="
echo ""

echo "[1/4] Initializing Git repository..."
git init

echo "[2/4] Setting remote repository origin..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/LegendKiler/timegovern-website.git

echo "[3/4] Staging and committing project files..."
git branch -M main
git add .
git commit -m "Master Deploy: Fully automated Cloudflare Workers + D1 Database + Custom Domain pipeline"

echo "[4/4] Pushing code to GitHub main branch..."
git push -u origin main --force

echo ""
echo "==================================================="
echo " SUCCESS! Code pushed to GitHub."
echo " GitHub Actions CI/CD pipeline triggered."
echo "==================================================="
