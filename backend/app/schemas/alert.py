from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    cryptocurrency: str
    condition: str  # "price_above", "price_below", "ai_anomaly"
    threshold_value: Optional[float] = None
    current_value: Optional[float] = None
    is_triggered: bool = False
    message: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    owner_id: Optional[int]  # None for system-generated alerts
    created_at: datetime

    class Config:
        from_attributes = True

class AIAnalysisResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    reconstruction_error: float
    threshold: float
    confidence: Optional[float] = None
    timestamp: Optional[str] = None
    error: Optional[str] = None
