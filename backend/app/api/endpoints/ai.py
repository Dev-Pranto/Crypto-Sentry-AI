from fastapi import APIRouter, Depends, HTTPException
from app.ai_model.service import ai_service
from typing import Dict

router = APIRouter()

@router.get("/status")
async def get_ai_status() -> Dict:
    """Get the status of the AI model"""
    return ai_service.get_model_status()

@router.get("/analyze/{symbol}")
async def analyze_symbol(symbol: str) -> Dict:
    """Analyze a cryptocurrency symbol for anomalies"""
    try:
        # Convert symbol to yfinance format if needed
        if '-' not in symbol:
            symbol = f"{symbol}-USD"

        result = ai_service.check_market_anomaly(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/analyze")
async def analyze_default() -> Dict:
    """Analyze default symbol (BTC-USD)"""
    return ai_service.check_market_anomaly("BTC-USD")
