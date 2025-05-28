# Maintenance and Troubleshooting Guide

## System Overview
The HAB (Harmful Algal Bloom) forecasting system runs as a Cloud Run job on Google Cloud Platform. It processes data from Google Drive sources and generates forecasts that are saved back to Google Drive.

### Key Components
- **Raw Data File**: `data_w_gaps_and_wind.csv` (ID: 1LzN-OFINR9J2thyiWeTfox4enmEqbfoq)
- **Parameters File**: `100_sample_baseline_models.csv` (ID: 1ZO5Hu-WNVGsDoUGsscrVVhLRdo6yE-cP)
- **Output Location**: `forecasts.json` in folder (ID: 1vZoEzNkDgMpMK4crc6iApOAjgDwprbKw)

## Common Tasks

### Updating Input Files
1. Upload new file to Google Drive
2. Share with service account email
3. Update environment variables in Cloud Run job:
```bash
gcloud run jobs update hab-forecast \
    --set-env-vars "RAW_DATA_FILE_ID=new_file_id"
```

### Modifying the Code
1. Make changes to the codebase
2. Update Dockerfile if dependencies change
3. Build and push new image:
```bash
PROJECT_ID=$(gcloud config get-value project)
docker build -t gcr.io/$PROJECT_ID/hab-forecast .
docker push gcr.io/$PROJECT_ID/hab-forecast
```
4. Update the Cloud Run job:
```bash
gcloud run jobs update hab-forecast \
    --image gcr.io/$PROJECT_ID/hab-forecast
```

## Troubleshooting

### Drive API Issues
1. Check service account permissions:
   - Verify file sharing settings
   - Ensure correct file IDs
   - Check service account key validity

2. Common error messages:
   - "File not found": Check file ID and sharing
   - "Insufficient permissions": Review Drive sharing settings
   - "Invalid credentials": Verify service account key

### Data Processing Errors
1. Check input data format:
   - CSV structure matches expected format
   - No missing required columns
   - Data types are correct

2. Review logs:
```bash
gcloud run jobs executions list hab-forecast
gcloud run jobs executions describe EXECUTION_NAME
```

### Cloud Run Job Issues
1. Check resource limits:
   - Memory allocation
   - CPU allocation
   - Timeout settings

2. Verify environment variables:
```bash
gcloud run jobs describe hab-forecast
```

## Monitoring and Maintenance

### Regular Checks
1. Monitor job execution success rate
2. Review system logs periodically
3. Verify forecast output generation
4. Check resource usage

### Best Practices
- Keep dependencies updated
- Regularly backup critical data
- Document all configuration changes
- Test changes in development environment first
- Monitor Google Cloud billing

### Security Considerations
- Rotate service account keys periodically
- Review IAM permissions regularly
- Keep secrets secure
- Monitor for unauthorized access

## Support and Resources
- GCP Documentation: https://cloud.google.com/run/docs
- Google Drive API: https://developers.google.com/drive/api/guides/about-sdk
- Project Repository: [Your repository URL]
- Internal Documentation: [Your internal docs URL] 