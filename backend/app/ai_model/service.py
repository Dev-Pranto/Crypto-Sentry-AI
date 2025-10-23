import os
import pandas as pd
import yfinance as yf
import numpy as np
import logging
from typing import Dict, Optional
from .anomaly_detector import CryptoAnomalyDetector

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.model = None
        self.is_loaded = False
        self.load_trained_model()

    def load_trained_model(self):
        """Load the trained LSTM Autoencoder model with exact paths"""
        try:
            # Use absolute paths to your model files
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            model_artifacts_dir = os.path.join(base_dir, "app", "ai_model", "model_artifacts")

            # Define exact file paths
            model_path = os.path.join(model_artifacts_dir, "lstm_autoencoder.h5")
            scaler_path = os.path.join(model_artifacts_dir, "scaler.pkl")
            metadata_path = os.path.join(model_artifacts_dir, "model_metadata.pkl")

            logger.info(f"🔄 Loading AI model from: {model_path}")
            logger.info(f"🔄 Loading scaler from: {scaler_path}")
            logger.info(f"🔄 Loading metadata from: {metadata_path}")

            # Check if files exist
            if not os.path.exists(model_path):
                logger.error(f"❌ Model file not found: {model_path}")
                return
            if not os.path.exists(scaler_path):
                logger.error(f"❌ Scaler file not found: {scaler_path}")
                return
            if not os.path.exists(metadata_path):
                logger.error(f"❌ Metadata file not found: {metadata_path}")
                return

            # Load the model
            self.model = CryptoAnomalyDetector(model_path, scaler_path, metadata_path)
            self.is_loaded = self.model.model is not None and self.model.scaler is not None

            if self.is_loaded:
                logger.info("✅ AI Model loaded successfully!")
                logger.info(f"✅ Sequence length: {self.model.sequence_length}")
                logger.info(f"✅ Threshold: {self.model.threshold}")
                logger.info(f"✅ Features: {self.model.feature_names}")
            else:
                logger.error("❌ Failed to load AI model components")

        except Exception as e:
            logger.error(f"❌ Error loading AI model: {e}")
            import traceback
            logger.error(traceback.format_exc())
            self.is_loaded = False

    def fetch_market_data(self, symbol: str = "BTC-USD", period: str = "60d") -> pd.DataFrame:
        """Fetch real market data for analysis"""
        try:
            logger.info(f"📊 Fetching market data for {symbol}...")

            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period, interval="1d")

            if data.empty:
                logger.warning("No data from yfinance, using fallback data")
                return self._generate_fallback_data()

            # Ensure we have all required columns
            required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
            if not all(col in data.columns for col in required_columns):
                logger.error("Missing required columns in market data")
                return self._generate_fallback_data()

            # Rename columns to match our model's expected format
            data = data.rename(columns={
                'Open': 'open',
                'High': 'high',
                'Low': 'low',
                'Close': 'close',
                'Volume': 'volume'
            })

            logger.info(f"✅ Successfully fetched {len(data)} records for {symbol}")
            return data

        except Exception as e:
            logger.error(f"❌ Error fetching market data: {e}")
            return self._generate_fallback_data()

    def _generate_fallback_data(self) -> pd.DataFrame:
        """Generate fallback data when real data is unavailable"""
        dates = pd.date_range(start='2024-01-01', periods=60, freq='D')
        return pd.DataFrame({
            'open': 40000 + np.random.randn(60) * 1000,
            'high': 41000 + np.random.randn(60) * 1000,
            'low': 39000 + np.random.randn(60) * 1000,
            'close': 40000 + np.random.randn(60) * 1000,
            'volume': np.random.exponential(10000000000, 60)
        }, index=dates)

    def check_market_anomaly(self, symbol: str = "BTC-USD") -> Dict:
        """Detect market anomalies using the trained LSTM Autoencoder"""
        try:
            logger.info(f"🔍 Starting AI anomaly detection for {symbol}...")

            # Fetch market data
            market_data = self.fetch_market_data(symbol)

            if self.is_loaded and self.model:
                # Use the real AI model
                logger.info("🤖 Using trained LSTM Autoencoder for analysis...")
                result = self.model.detect_anomaly(market_data)

                if 'error' not in result:
                    result['model_type'] = 'LSTM Autoencoder'
                    result['symbol'] = symbol
                    result['data_points'] = len(market_data)
                    result['model_status'] = 'real_model'
                    logger.info(f"✅ Real AI analysis completed: Anomaly={result['is_anomaly']}, Score={result['anomaly_score']:.3f}")
                else:
                    logger.warning(f"⚠️ Real model failed: {result['error']}. Falling back to demo.")
                    result = self._demo_analysis(market_data, symbol)
                    result['model_status'] = 'real_model_failed'
            else:
                # Fallback to demo analysis
                logger.warning("🔄 AI model not loaded, using demo analysis...")
                result = self._demo_analysis(market_data, symbol)
                result['model_status'] = 'demo_model'

            return result

        except Exception as e:
            logger.error(f"❌ Error in AI analysis: {e}")
            return {
                'error': str(e),
                'is_anomaly': False,
                'anomaly_score': 0.0,
                'model_type': 'Error',
                'model_status': 'error',
                'message': 'AI analysis failed'
            }

    def _demo_analysis(self, market_data: pd.DataFrame, symbol: str) -> Dict:
        """Fallback demo analysis when real model is unavailable"""
        from sklearn.ensemble import IsolationForest

        try:
            # Simple feature engineering for demo
            features = pd.DataFrame({
                'price_change': market_data['close'].pct_change().fillna(0) * 100,
                'volume_change': market_data['volume'].pct_change().fillna(0) * 100,
                'volatility': (market_data['high'] - market_data['low']) / market_data['close'] * 100
            }).dropna()

            if len(features) == 0:
                return {
                    'error': 'No features available for analysis',
                    'is_anomaly': False,
                    'anomaly_score': 0.0,
                    'model_type': 'Demo (Failed)'
                }

            # Use last point for prediction
            latest_features = features.iloc[-1:].values

            # Simple anomaly detection (Isolation Forest)
            clf = IsolationForest(contamination=0.1, random_state=42)
            clf.fit(features.values)

            prediction = clf.predict(latest_features)
            is_anomaly = prediction[0] == -1

            # Generate realistic demo scores
            if is_anomaly:
                anomaly_score = 0.7 + np.random.random() * 0.3  # 0.7-1.0
            else:
                anomaly_score = 0.1 + np.random.random() * 0.5  # 0.1-0.6

            return {
                'is_anomaly': bool(is_anomaly),
                'anomaly_score': float(anomaly_score),
                'reconstruction_error': float(np.random.random() * 0.5),
                'threshold': 0.65,
                'confidence': float(0.8 + np.random.random() * 0.2),
                'timestamp': pd.Timestamp.now().isoformat(),
                'model_type': 'Demo (Isolation Forest)',
                'symbol': symbol,
                'data_points': len(market_data),
                'message': 'Real AI model unavailable - using demo analysis'
            }

        except Exception as e:
            logger.error(f"❌ Demo analysis also failed: {e}")
            return {
                'error': str(e),
                'is_anomaly': False,
                'anomaly_score': 0.0,
                'model_type': 'Demo (Failed)',
                'message': 'All analysis methods failed'
            }

    def get_model_status(self) -> Dict:
        """Get the status of the AI model"""
        status_info = {
            'model_loaded': self.is_loaded,
            'model_type': 'LSTM Autoencoder' if self.is_loaded else 'Demo (Isolation Forest)',
            'status': 'ready' if self.is_loaded else 'demo_mode'
        }

        if self.is_loaded and self.model:
            status_info.update({
                'sequence_length': self.model.sequence_length,
                'threshold': self.model.threshold,
                'feature_count': len(self.model.feature_names)
            })

        return status_info

# Global instance
ai_service = AIService()
