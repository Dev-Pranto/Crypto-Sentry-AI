# app/worker/tasks.py
import requests
from .celery_app import celery
import logging
from app.ai_model.service import ai_service
from app.db.base import get_db
from app.db import models
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

@celery.task
def fetch_crypto_data():
    """
    Enhanced task to fetch crypto data and run AI anomaly detection
    """
    logger.info("🤖 Starting crypto data fetch and AI analysis...")

    try:
        # 1. Fetch Bitcoin price from CoinGecko (your existing code)
        url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        btc_price = data['bitcoin']['usd']
        btc_volume = data['bitcoin']['usd_24h_vol']

        logger.info(f"✅ Successfully fetched Bitcoin data: Price=${btc_price}, Volume=${btc_volume}")

        # 2. Run AI Anomaly Detection
        logger.info("🔍 Running AI anomaly detection...")
        ai_result = ai_service.check_market_anomaly("BTC-USD")

        # 3. If anomaly detected, create alert in database
        if ai_result.get('is_anomaly') and not ai_result.get('error'):
            logger.info(f"🚨 AI detected anomaly! Score: {ai_result['anomaly_score']:.3f}")

            # Get database session
            db: Session = next(get_db())
            try:
                # Create system alert for the anomaly
                alert = models.Alert(
                    cryptocurrency="BTC",
                    condition="ai_anomaly",
                    threshold_value=ai_result['threshold'],
                    current_value=ai_result['reconstruction_error'],
                    is_triggered=True,
                    owner_id=None,  # System-generated alert
                    message=f"AI detected market anomaly: Score {ai_result['anomaly_score']:.3f} (Error: {ai_result['reconstruction_error']:.4f})"
                )
                db.add(alert)
                db.commit()
                logger.info("📝 Anomaly alert saved to database")

            except Exception as db_error:
                logger.error(f"❌ Database error: {db_error}")
                db.rollback()
            finally:
                db.close()
        else:
            logger.info("✅ No anomalies detected by AI")

        return {
            "price_data": {
                "btc_price": btc_price,
                "btc_volume": btc_volume
            },
            "ai_analysis": ai_result,
            "message": "Data fetch and AI analysis completed successfully"
        }

    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error fetching data from CoinGecko: {e}")
        return {"error": "Failed to fetch price data"}
    except Exception as e:
        logger.error(f"❌ Unexpected error in fetch_crypto_data: {e}")
        return {"error": str(e)}

@celery.task
def run_ai_analysis_only():
    """
    Task to run only AI analysis without fetching new price data
    Useful for more frequent anomaly checks
    """
    logger.info("🧠 Running standalone AI analysis...")

    try:
        ai_result = ai_service.check_market_anomaly("BTC-USD")

        # Create alert if anomaly detected
        if ai_result.get('is_anomaly') and not ai_result.get('error'):
            db: Session = next(get_db())
            try:
                alert = models.Alert(
                    cryptocurrency="BTC",
                    condition="ai_anomaly",
                    threshold_value=ai_result['threshold'],
                    current_value=ai_result['reconstruction_error'],
                    is_triggered=True,
                    owner_id=None,
                    message=f"AI Anomaly Detected: Score {ai_result['anomaly_score']:.3f}"
                )
                db.add(alert)
                db.commit()
                logger.info("🚨 Anomaly alert created")
            except Exception as db_error:
                logger.error(f"Database error: {db_error}")
                db.rollback()
            finally:
                db.close()

        return {
            "ai_analysis": ai_result,
            "timestamp": "Analysis completed"
        }

    except Exception as e:
        logger.error(f"Error in AI analysis: {e}")
        return {"error": str(e)}
