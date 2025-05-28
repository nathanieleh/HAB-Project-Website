# HAB Project Backend

This is the backend component of the HAB (Harmful Algal Bloom) Project, responsible for generating bioluminescence forecasts using ML models.

## Documentation

The setup and maintenance documentation has been split into two main files:

1. [Initial Setup Guide](INITIAL_SETUP.md) - Complete instructions for setting up the project from scratch
2. [Maintenance Guide](MAINTENANCE.md) - Instructions for maintaining, troubleshooting, and updating the system

## Important Links

### Google Cloud Setup
- [Google Cloud SDK Installation Guide](https://cloud.google.com/sdk/docs/install)
- [Google Cloud Console](https://console.cloud.google.com)
- [Cloud Run Documentation](https://cloud.google.com/run/docs/quickstarts)
- [Cloud Run Jobs Guide](https://cloud.google.com/run/docs/quickstarts/jobs/create-execute)
- [Google Cloud Shell](https://shell.cloud.google.com)

## Windows Development Requirements

If you're developing on Windows, you MUST use WSL (Windows Subsystem for Linux) for Docker operations:

1. **WSL Setup**
   - Install WSL2 if not already installed
   - Use Ubuntu as the recommended distribution
   - All Docker and Google Cloud operations must be performed within WSL

2. **Required WSL Installations**
   - Docker Engine (NOT Docker Desktop for Windows)
   - Google Cloud SDK (separate installation inside WSL)
   - Python and development tools

3. **Important Notes**
   - Do not use Windows Git Bash or CMD for Docker/GCP operations
   - Install and configure Google Cloud SDK inside WSL separately from any Windows installation
   - Service account keys and credentials should be stored in the WSL filesystem
   - Environment variables must be set in your WSL environment

For detailed WSL setup instructions, refer to the [Initial Setup Guide](INITIAL_SETUP.md).

## System Overview

The backend currently operates as a Cloud Run job that:
1. Fetches input data from Google Drive
2. Processes it using the ML model
3. Uploads the results back to Google Drive

### Key Files in Google Drive

1. **Raw Data CSV** (`data_w_gaps_and_wind.csv`)
   - ID: `1LzN-OFINR9J2thyiWeTfox4enmEqbfoq`
   - Contains historical data with required columns:
     - `time`: timestamp
     - `Avg_Chloro`: target variable
     - Other system variables used by the model

2. **Parameters File** (`100_sample_baseline_models.csv`)
   - ID: `1ZO5Hu-WNVGsDoUGsscrVVhLRdo6yE-cP`
   - Contains model parameters:
     - `pred`: prediction values
     - `columns`: model column configurations
     - `E`: embedding dimension
     - `theta`: model parameter

3. **Output Location**
   - Folder ID: `1vZoEzNkDgMpMK4crc6iApOAjgDwprbKw`
   - Contains `forecasts.json` with the latest predictions

### Output Format

The forecast is saved as a JSON file with the following structure:
```json
[
  {"day": "Sunday", "value": 760},
  {"day": "Monday", "value": 260},
  {"day": "Tuesday", "value": 10},
  {"day": "Wednesday", "value": 60},
  {"day": "Thursday", "value": 400},
  {"day": "Friday", "value": 560},
  {"day": "Saturday", "value": 920}
]
```

- The `value` represents the number of models predicting a bloom
- Each new forecast overwrites the previous one
- The file ID remains constant for frontend consistency

For detailed setup instructions, refer to [Initial Setup Guide](INITIAL_SETUP.md).
For maintenance and troubleshooting, refer to [Maintenance Guide](MAINTENANCE.md). 