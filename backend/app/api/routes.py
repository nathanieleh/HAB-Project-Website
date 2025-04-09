from fastapi import APIRouter, HTTPException, Query
from datetime import date
from typing import List
from app.services.prediction_loader import get_prediction_by_date, get_predictions_range, get_latest_week
from app.models.prediction_model import DailyPrediction

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
