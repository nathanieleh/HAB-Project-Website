# HAB Project Backend

This is the backend component of the HAB (Harmful Algal Bloom) Project, responsible for generating bioluminescence forecasts using ML models.

## Current Implementation

The backend currently operates in two modes:
1. Original workflow (currently disabled, kept for reference)
2. Temporary Google Drive-based workflow (active)

## Temporary Google Drive Workflow

### Overview
The temporary workflow fetches input data from Google Drive, processes it using the ML model, and uploads the results back to Google Drive. This workflow is designed to work with the frontend's data fetching mechanism.

### Prerequisites

1. **Google Cloud Setup**
```bash
# 1. Create a Google Cloud Project
# 2. Enable Google Drive API
# 3. Create a Service Account
# 4. Download service account key JSON
```

2. **Environment Setup**
```bash
# Set up Python environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Set Google credentials environment variable
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
# On Windows:
# set GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

### Required Google Drive Files

1. **Raw Data CSV**
   - Format: CSV file containing historical data
   - Required columns:
     - `time`: timestamp
     - `Avg_Chloro`: target variable
     - Other system variables used by the model

2. **Parameters File**
   - Format: CSV file containing model parameters
   - Required columns:
     - `pred`: prediction values (will be converted to list)
     - `columns`: model column configurations
     - `E`: embedding dimension
     - `theta`: model parameter

3. **Output Folder**
   - A Google Drive folder where forecast results will be uploaded
   - Must be writable by the service account

### Usage

```bash
python forecast.py \
  --raw-data-id "your-raw-data-file-id" \
  --parameters-id "your-parameters-file-id" \
  --output-folder-id "your-output-folder-id"
```

### File IDs
To get file/folder IDs from Google Drive:
1. Open the file/folder in Google Drive
2. URL will be: `https://drive.google.com/file/d/FILE_ID/view`
   or `https://drive.google.com/drive/folders/FOLDER_ID`
3. Copy the FILE_ID or FOLDER_ID part

### Output Format

The script generates a JSON file with the following structure:
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

- File name: `latest_forecast.json` (consistent name, overwrites previous version)
- The `value` represents the number of models predicting a bloom
- Files are automatically cleaned up locally after upload
- If the model fails to run, this exact default data will be uploaded

### File Management

- The script maintains a single forecast file in the output folder
- Each new forecast overwrites the previous one
- This ensures the frontend always fetches the most recent data
- The file ID remains constant, making it easier to configure the frontend

### Error Handling

The script includes error handling for:
- Google Drive API initialization failures
- File download/upload issues
- Data processing errors
- Model execution errors

All errors are logged to the console with descriptive messages.

### Workflow Steps

1. **Initialization**
   - Validates command line arguments
   - Initializes Google Drive service
   - Checks credentials and permissions

2. **Data Retrieval**
   - Downloads raw data CSV
   - Downloads parameters file
   - Stores files temporarily

3. **Processing**
   - Cleans and processes raw data
   - Applies model parameters
   - Generates 7-day forecast

4. **Output**
   - Formats results as JSON
   - Uploads to specified Drive folder
   - Cleans up temporary files

### Common Issues

1. **Authentication Errors**
   ```
   Solution: Ensure GOOGLE_APPLICATION_CREDENTIALS is set correctly
   ```

2. **Permission Errors**
   ```
   Solution: Share Drive files/folders with service account email
   ```

3. **File Not Found**
   ```
   Solution: Verify file IDs are correct and files exist
   ```

### Development Notes

- The original workflow is preserved in comments for reference
- Model parameters are hardcoded (n=300, p=0.05) but can be made configurable
- Temporary files are created in the script directory
- All Drive operations use the same service account

For the original workflow documentation, refer to the commented section in `forecast.py`. 