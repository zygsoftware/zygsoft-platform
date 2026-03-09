#!/usr/bin/env bash
# Run UDF Converter API locally
# Default: http://127.0.0.1:8000

cd "$(dirname "$0")"

if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "Installing API dependencies..."
    pip install -r requirements-api.txt -q
fi

if ! python3 -c "import docx" 2>/dev/null; then
    echo "Installing base dependencies..."
    pip install -r requirements.txt -q
fi

uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
