# HAB Project Frontend

This is the frontend application for the HAB (Harmful Algal Bloom) Project, providing real-time bioluminescence forecasts for Scripps Pier, La Jolla.

## Setup Instructions

### 1. Environment Setup

Create a `.env.local` file in the frontend directory with the following:

```env
# Google Drive API credentials (Service Account JSON)
GOOGLE_APPLICATION_CREDENTIALS={"type": "service_account", ...} # Your full service account JSON

# Google Drive File ID for forecast data
NEXT_PUBLIC_FORECAST_FILE_ID=your-file-id
```

### 2. Google Drive Setup

1. Create a Google Cloud Project
2. Enable the Google Drive API
3. Create a Service Account and download credentials
4. Share your forecast data folder with the service account email
5. Note down the File ID from Google Drive URL

### 3. Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Architecture

### Data Flow
1. Weekly scheduled job runs ML model (separate backend process)
2. Results are saved to Google Drive as JSON file
3. Frontend fetches latest data from Google Drive via API route
4. Data is validated and displayed to user

### Components
- `page.js`: Main page component, handles data fetching
- `api/forecast/route.js`: API route for Google Drive interaction
- Components:
  - `TopBar`: 7-day forecast overview
  - `Today`: Detailed current day forecast
  - `Graph`: Weekly forecast visualization

### Data Format
The forecast JSON file should follow this structure:
```json
[
  { "day": "Sunday", "value": 760 },
  { "day": "Monday", "value": 260 },
  ...
]
```

## Error Handling
- Invalid/missing Google Drive credentials
- File not found or inaccessible
- Invalid data format
- Network failures

## Performance
- Request timing logged to console
- No-store cache policy for real-time data
- Google Drive API for reliable file storage/retrieval
