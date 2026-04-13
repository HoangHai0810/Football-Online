FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml .
# Create a dummy src to satisfy editable install
RUN mkdir src && touch src/__init__.py

# Install dependencies
RUN pip install --no-cache-dir .

# Copy source code
COPY src/ ./src/
# Ensure PYTHONPATH is set so that 'agent' and 'tools' can be imported
ENV PYTHONPATH=/app/src

# Expose the port (Render provides this)
EXPOSE 8000

# Start command
CMD ["python", "src/server.py"]
