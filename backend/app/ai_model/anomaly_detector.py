import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
import logging
import os

logger = logging.getLogger(__name__)

class CryptoAnomalyDetector:
    def __init__(self, model_path, scaler_path, metadata_path):
        """Initialize the anomaly detector with trained artifacts"""
        try:
            logger.info(f"🔧 Loading model from: {model_path}")
            logger.info(f"🔧 Loading scaler from: {scaler_path}")
            logger.info(f"🔧 Loading metadata from: {metadata_path}")

            # Verify files exist
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            if not os.path.exists(scaler_path):
                raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
            if not os.path.exists(metadata_path):
                raise FileNotFoundError(f"Metadata file not found: {metadata_path}")

            # Load model with custom objects to avoid compatibility issues
            custom_objects = {}
            self.model = load_model(model_path, compile=False, custom_objects=custom_objects)

            # Load scaler and metadata
            self.scaler = joblib.load(scaler_path)
            self.metadata = joblib.load(metadata_path)

            # Extract configuration
            self.sequence_length = self.metadata.get('sequence_length', 30)
            self.threshold = self.metadata.get('threshold', 0.1)
            self.feature_names = self.metadata.get('feature_names', [])

            logger.info(f"✅ Model loaded: sequence_length={self.sequence_length}, threshold={self.threshold}")
            logger.info(f"✅ Features: {self.feature_names}")

        except Exception as e:
            logger.error(f"❌ Failed to load AI model: {e}")
            import traceback
            logger.error(traceback.format_exc())
            self.model = None
            self.scaler = None
            self.metadata = None
            raise

    def calculate_basic_features(self, df):
        """Calculate basic technical indicators without pandas-ta"""
        try:
            df_ta = df.copy()

            # Basic price features
            df_ta['price_change'] = df_ta['close'].pct_change() * 100
            df_ta['high_low_ratio'] = df_ta['high'] / df_ta['low']
            df_ta['open_close_ratio'] = df_ta['open'] / df_ta['close']

            # Volume-based features
            df_ta['volume_change'] = df_ta['volume'].pct_change() * 100
            df_ta['volume_ma_ratio'] = df_ta['volume'] / df_ta['volume'].rolling(7).mean()

            # Simple moving averages (replace EMA)
            df_ta['sma_30'] = df_ta['close'].rolling(30).mean()
            df_ta['sma_50'] = df_ta['close'].rolling(50).mean()
            df_ta['sma_ratio'] = df_ta['sma_30'] / df_ta['sma_50']

            # Simple volatility (replace ATR)
            df_ta['volatility'] = (df_ta['high'] - df_ta['low']) / df_ta['close'] * 100

            # Simple RSI calculation
            delta = df_ta['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df_ta['rsi'] = 100 - (100 / (1 + rs))

            # Simple OBV
            df_ta['obv'] = (np.sign(df_ta['close'].diff()) * df_ta['volume']).fillna(0).cumsum()
            df_ta['obv_change'] = df_ta['obv'].pct_change() * 100

            return df_ta.fillna(method='bfill').fillna(method='ffill')

        except Exception as e:
            logger.error(f"❌ Error calculating features: {e}")
            raise

    def detect_anomaly(self, new_data_df):
        """Detect if the latest data contains anomalies"""
        if not self.model:
            return {
                'error': 'AI model not loaded',
                'is_anomaly': False,
                'anomaly_score': 0.0
            }

        try:
            # Calculate features
            processed_data = self.calculate_basic_features(new_data_df)

            # Use only features that are available and match training
            available_features = [f for f in self.feature_names if f in processed_data.columns]
            if len(available_features) == 0:
                return {
                    'error': f'No matching features found. Available: {list(processed_data.columns)}, Expected: {self.feature_names}',
                    'is_anomaly': False,
                    'anomaly_score': 0.0
                }

            features = processed_data[available_features].tail(self.sequence_length)

            if len(features) < self.sequence_length:
                return {
                    'error': f'Need at least {self.sequence_length} data points, got {len(features)}',
                    'is_anomaly': False,
                    'anomaly_score': 0.0
                }

            # Scale and predict
            scaled_features = self.scaler.transform(features)
            sequence = scaled_features.reshape(1, self.sequence_length, len(available_features))

            reconstruction = self.model.predict(sequence, verbose=0)
            mae = np.mean(np.abs(reconstruction - sequence))

            is_anomaly = mae > self.threshold
            anomaly_score = mae / self.threshold

            return {
                'is_anomaly': bool(is_anomaly),
                'anomaly_score': float(anomaly_score),
                'reconstruction_error': float(mae),
                'threshold': float(self.threshold),
                'confidence': float(1 - min(anomaly_score, 2.0) / 2.0),
                'timestamp': pd.Timestamp.now().isoformat(),
                'features_used': available_features
            }

        except Exception as e:
            logger.error(f"❌ Error in anomaly detection: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                'error': str(e),
                'is_anomaly': False,
                'anomaly_score': 0.0
            }
