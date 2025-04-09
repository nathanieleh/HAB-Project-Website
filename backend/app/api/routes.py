from fastapi import APIRouter, HTTPException, Query, File, UploadFile
from datetime import date
from typing import List
from app.services.prediction_loader import get_prediction_by_date, get_predictions_range, get_latest_week
from app.models.prediction_model import DailyPrediction
import pandas as pd


router = APIRouter()

@router.get("/predictions/today", response_model=DailyPrediction)
def get_today_prediction():
    return get_prediction_by_date(date.today())

@router.get("/predictions/week", response_model=List[DailyPrediction])
def get_this_week_prediction():
    return get_latest_week()

@router.get("/predictions/history", response_model=List[DailyPrediction])
def get_historical_predictions(start: date = Query(...), end: date = Query(...)):
    return get_predictions_range(start, end)


@router.post("/submit/data", response_model=List[DailyPrediction])
async def submit_raw_data(file: UploadFile = File(...)):
    # Read the uploaded file as bytes → decode → pandas
    contents = await file.read()
    df = pd.read_csv(pd.io.common.BytesIO(contents))
    
    # TEMP: Replace this with actual model inference logic
    predictions = []
    for _, row in df.iterrows():
        # Dummy prediction from row — replace with your model's output
        predictions.append(DailyPrediction(
            date=str(row.get("date")),
            value=float(row.get("value", 0)),
            bloom_detected=float(row.get("value", 0)) > 7.7,
        ))

    return predictions
