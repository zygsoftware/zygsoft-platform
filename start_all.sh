#!/bin/bash
# Zygsoft SaaS - Start Next.js and Python FastAPI Servers

echo "Starting Next.js Frontend and Backend API (Port 3000)..."
npm run dev &

echo "Starting Python FastAPI UDF Toolkit (Port 8000)..."
cd python-api

# Create and activate virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate

echo "Installing requirements..."
pip install -r requirements.txt

echo "Starting Uvicorn Server..."
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
