# Initial Setup Guide for New Projects

## 1. Google Cloud Setup
```bash
# Install Google Cloud SDK if not already installed
# Then initialize your project
gcloud init

# Enable required Google Cloud APIs
gcloud services enable \
    drive.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    cloudscheduler.googleapis.com \
    run.googleapis.com
```

## 2. Service Account Setup
```bash
# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Create service account
gcloud iam service-accounts create hab-forecast \
    --description="HAB Forecast Service Account" \
    --display-name="HAB Forecast"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:hab-forecast@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

# Create and download service account key
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=hab-forecast@$PROJECT_ID.iam.gserviceaccount.com
```

## 3. Google Drive Setup
1. Create a folder in Google Drive for your project
2. Upload your input files:
   - Raw data CSV file
   - Parameters CSV file
3. Share the folder with your service account email:
   - Open folder sharing settings
   - Add `hab-forecast@YOUR_PROJECT_ID.iam.gserviceaccount.com`
   - Grant "Editor" access
   - Uncheck "Notify people"
4. Note down the following IDs from the URLs:
   - Raw data file ID
   - Parameters file ID
   - Folder ID

## 4. Create Secret in Google Cloud
```bash
# Create secret for service account key
gcloud secrets create hab-service-account \
    --data-file=service-account-key.json
```

## 5. Configure Docker
```bash
# Configure Docker to use gcloud credentials
gcloud auth configure-docker
```

## 6. Build and Deploy
```bash
# Build and push Docker image
docker build -t gcr.io/$PROJECT_ID/hab-forecast .
docker push gcr.io/$PROJECT_ID/hab-forecast

# Create Cloud Run job
gcloud run jobs create hab-forecast \
    --image gcr.io/$PROJECT_ID/hab-forecast \
    --region us-west1 \
    --set-env-vars "RAW_DATA_FILE_ID=your_raw_data_file_id,PARAMETERS_FILE_ID=your_parameters_file_id,OUTPUT_FOLDER_ID=your_folder_id,GOOGLE_APPLICATION_CREDENTIALS=/secrets/service-account-key.json" \
    --set-secrets "/secrets/service-account-key.json=hab-service-account:latest"
```

## 7. Test the Deployment
```bash
# Execute the job
gcloud run jobs execute hab-forecast
```

## Important Notes
- Keep your service account key secure and never commit it to version control
- The service account needs Editor access to the Google Drive folder
- All file IDs can be found in the URLs when viewing files in Google Drive
- Monitor the job execution logs for any errors
- Make sure all required dependencies are listed in requirements.txt 