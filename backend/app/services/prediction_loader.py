import os
import json
from datetime import date, timedelta
from app.models.prediction_model import DailyPrediction

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'predictions')

def load_prediction_file(file_path: str) -> DailyPrediction:
    with open(file_path, "r") as f:
        data = json.load(f)
    return DailyPrediction(**data)

def get_prediction_by_date(d: date) -> DailyPrediction:
    file_path = os.path.join(DATA_DIR, f"{d}.json")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"No prediction for date: {d}")
    return load_prediction_file(file_path)

def get_predictions_range(start: date, end: date):
    predictions = []
    for i in range((end - start).days + 1):
        day = start + timedelta(days=i)
        try:
            predictions.append(get_prediction_by_date(day))
        except FileNotFoundError:
            continue
    return predictions

def get_latest_week():
    today = date.today()
    # Assuming predictions are always available for a rolling 7-day week
    return get_predictions_range(today, today + timedelta(days=6))