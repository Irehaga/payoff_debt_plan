#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Set environment variables
export ENV=production

# Start the server with production settings
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --log-level info 