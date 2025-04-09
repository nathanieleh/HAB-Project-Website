from pydantic import BaseModel
from datetime import date

class DailyPrediction(BaseModel):
    date: date
    prediction_score: float
    bloom_level: str  # e.g. 'Low', 'Moderate', 'High', 'Severe'
