# Base Python image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system-level dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgsl-dev \
    libcurl4-openssl-dev \
    libxml2-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy relevant files
COPY requirements.txt ./
COPY app/ ./

# Install pyEDM from GitHub + other packages
RUN pip install --no-cache-dir git+https://github.com/SugiharaLab/pyEDM.git && \
    pip install --no-cache-dir -r requirements.txt

# Create directory for service account key
RUN mkdir -p /secrets

# Set default environment variables (these should be overridden during deployment)
ENV GOOGLE_APPLICATION_CREDENTIALS=/secrets/service-account-key.json
ENV RAW_DATA_FILE_ID=""
ENV PARAMETERS_FILE_ID=""
ENV OUTPUT_FOLDER_ID=""

# Set the entrypoint with environment variable support
ENTRYPOINT ["python3", "forecast.py", \
            "--raw-data-id", "${RAW_DATA_FILE_ID}", \
            "--parameters-id", "${PARAMETERS_FILE_ID}", \
            "--output-folder-id", "${OUTPUT_FOLDER_ID}"]
