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

# Create a wrapper script to pass environment variables as arguments
RUN echo '#!/bin/bash\n\
python3 forecast.py \
--raw-data-id "$RAW_DATA_FILE_ID" \
--parameters-id "$PARAMETERS_FILE_ID" \
--output-folder-id "$OUTPUT_FOLDER_ID"' > /app/run.sh && \
chmod +x /app/run.sh

# Set the entrypoint to use the wrapper script
ENTRYPOINT ["/app/run.sh"]
