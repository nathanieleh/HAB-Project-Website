# ─── Imports ───────────────────────────────────────────
from fastapi import APIRouter, File, UploadFile
import pandas as pd
import os, json, requests
from datetime import date, timedelta



# ─── Constants ─────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'predictions')

# ─── Utility Functions ─────────────────────────────────

## saves google sheet to backend/app/data folder by default
def download_google_sheet(sheet_id: str, destination: str = os.path.join(os.path.dirname(__file__), '..', 'data'), gid: str = "0") -> str:
    """
    Downloads a Google Sheet (as CSV) to the given destination.
    
    Args:
        sheet_id (str): The unique Google Sheets file ID (from URL).
        destination (str): The path to save the downloaded CSV.
        gid (str): Optional. The specific sheet/tab ID (default "0").

    Returns:
        str: The file path of the downloaded CSV.
    """
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"

    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to download sheet: {response.status_code}")

    os.makedirs(os.path.dirname(destination), exist_ok=True)
    with open(destination, "wb") as f:
        f.write(response.content)

    return destination

# loads json file into dictionary
def load_prediction_file(file_path: str) -> dict:
    with open(file_path, "r") as f:
        data = json.load(f)
    return data

# ─── API Router ────────────────────────────────────────

router = APIRouter()

@router.get("/predictions/all")
def get_all_predictions():
    predictions = []

    for filename in os.listdir(DATA_DIR):
        if filename.endswith(".json"):
            file_path = os.path.join(DATA_DIR, filename)
            try:
                prediction = load_prediction_file(file_path)
                predictions.append(prediction)
            except Exception as e:
                print(f"Skipping {filename} due to error: {e}")

    return predictions


@router.post("/submit/data")
async def submit_raw_data(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(pd.io.common.BytesIO(contents))

    predictions = []
    ### replace below for loop with actual model call
    for _, row in df.iterrows():
        predictions.append({ 
            "date": str(row.get("date")),
            "prediction_score": float(row.get("value", 0)),
            "bloom_level": (
                "Severe" if row.get("value", 0) >= 9 else
                "High" if row.get("value", 0) >= 7 else
                "Moderate" if row.get("value", 0) >= 5 else
                "Low"
            )
        })

    return predictions