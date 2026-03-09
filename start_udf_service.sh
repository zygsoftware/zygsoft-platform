#!/bin/bash
cd /Users/gunesai/Desktop/zygsoft/python-api
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn python-multipart
uvicorn app:app --port 8000 --reload
