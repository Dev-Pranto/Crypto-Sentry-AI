# app/api/endpoints/alerts.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.db import models
from app.schemas import alert as alert_schema
from app.schemas import user as user_schema
from app.api import deps
from app.ai_model.service import ai_service

router = APIRouter()

@router.post("/", response_model=alert_schema.Alert)
def create_alert(
    alert: alert_schema.AlertCreate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(deps.get_current_user)
):
    new_alert = models.Alert(**alert.model_dump(), owner_id=current_user.id)
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert

@router.get("/", response_model=List[alert_schema.Alert])
def read_alerts(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(deps.get_current_user)
):
    alerts = db.query(models.Alert).filter(models.Alert.owner_id == current_user.id).all()
    return alerts

# NEW AI ENDPOINTS
@router.get("/ai/status")
async def get_ai_status():
    """Check if AI model is loaded and ready"""
    status = {
        'model_loaded': ai_service.detector is not None,
        'status': 'ready' if ai_service.detector else 'not_ready',
        'message': 'AI anomaly detection system' + (' is READY' if ai_service.detector else ' failed to load')
    }
    return status

@router.post("/ai/analyze", response_model=alert_schema.AIAnalysisResult)
async def analyze_market(
    symbol: str = "BTC-USD"
):
    """Manually trigger AI market analysis"""
    try:
        result = ai_service.check_market_anomaly(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai/system-alerts")
def get_system_alerts(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(deps.get_current_user)
):
    """Get AI-generated system alerts (available to all authenticated users)"""
    system_alerts = db.query(models.Alert).filter(
        models.Alert.owner_id.is_(None),  # System alerts have no owner
        models.Alert.condition == "ai_anomaly"
    ).order_by(models.Alert.created_at.desc()).limit(50).all()
    return system_alerts
