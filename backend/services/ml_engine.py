"""
ML Prediction Engine for SpectroBot
Local machine learning model for price prediction
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import logging

logger = logging.getLogger(__name__)


class MLPredictionEngine:
    """Local ML engine for price prediction and direction classification"""
    
    def __init__(self):
        self.direction_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.price_model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = []
    
    def prepare_features(self, ohlcv_data: List[Dict], indicators: Dict, lookback: int = 10) -> Tuple[np.ndarray, List[str]]:
        """Prepare feature matrix from OHLCV data and indicators"""
        features = []
        feature_names = []
        
        closes = [d["close"] for d in ohlcv_data]
        highs = [d["high"] for d in ohlcv_data]
        lows = [d["low"] for d in ohlcv_data]
        volumes = [d.get("volume", 0) for d in ohlcv_data]
        
        n = len(closes)
        
        for i in range(lookback, n):
            row = []
            names = []
            
            # Price features
            row.append(closes[i])
            names.append("close")
            
            # Price changes
            for j in [1, 3, 5, 10]:
                if i >= j:
                    pct_change = (closes[i] - closes[i-j]) / closes[i-j] * 100
                    row.append(pct_change)
                    names.append(f"pct_change_{j}")
                else:
                    row.append(0)
                    names.append(f"pct_change_{j}")
            
            # Volatility (high-low range)
            row.append((highs[i] - lows[i]) / closes[i] * 100)
            names.append("volatility")
            
            # Volume change
            if i > 0 and volumes[i-1] > 0:
                row.append((volumes[i] - volumes[i-1]) / volumes[i-1] * 100)
            else:
                row.append(0)
            names.append("volume_change")
            
            # Technical indicators
            ema_short = indicators.get("ema_short", [])
            ema_long = indicators.get("ema_long", [])
            rsi = indicators.get("rsi", [])
            macd_data = indicators.get("macd", {})
            atr = indicators.get("atr", [])
            supertrend_data = indicators.get("supertrend", {})
            
            # EMA spread
            if i < len(ema_short) and i < len(ema_long):
                if ema_short[i] is not None and ema_long[i] is not None:
                    row.append((ema_short[i] - ema_long[i]) / closes[i] * 100)
                else:
                    row.append(0)
            else:
                row.append(0)
            names.append("ema_spread")
            
            # RSI
            if i < len(rsi) and rsi[i] is not None:
                row.append(rsi[i])
            else:
                row.append(50)
            names.append("rsi")
            
            # MACD histogram
            histogram = macd_data.get("histogram", [])
            if i < len(histogram) and histogram[i] is not None:
                row.append(histogram[i])
            else:
                row.append(0)
            names.append("macd_histogram")
            
            # ATR normalized
            if i < len(atr) and atr[i] is not None:
                row.append(atr[i] / closes[i] * 100)
            else:
                row.append(0)
            names.append("atr_normalized")
            
            # SuperTrend direction
            direction = supertrend_data.get("direction", [])
            if i < len(direction) and direction[i] is not None:
                row.append(direction[i])
            else:
                row.append(0)
            names.append("supertrend_direction")
            
            features.append(row)
            if not feature_names:
                feature_names = names
        
        self.feature_names = feature_names
        return np.array(features), feature_names
    
    def prepare_labels(self, ohlcv_data: List[Dict], horizon: int = 5, lookback: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare labels for direction (up/down) and price targets"""
        closes = [d["close"] for d in ohlcv_data]
        n = len(closes)
        
        direction_labels = []
        price_targets = []
        
        for i in range(lookback, n - horizon):
            future_price = closes[i + horizon]
            current_price = closes[i]
            
            # Direction: 1 = up, 0 = down
            direction = 1 if future_price > current_price else 0
            direction_labels.append(direction)
            
            # Price change percentage
            price_change = (future_price - current_price) / current_price * 100
            price_targets.append(price_change)
        
        return np.array(direction_labels), np.array(price_targets)
    
    def train(self, ohlcv_data: List[Dict], indicators: Dict, 
              horizon: int = 5, lookback: int = 10) -> Dict:
        """Train ML models on historical data"""
        try:
            features, _ = self.prepare_features(ohlcv_data, indicators, lookback)
            direction_labels, price_targets = self.prepare_labels(ohlcv_data, horizon, lookback)
            
            # Align features and labels
            min_len = min(len(features), len(direction_labels))
            features = features[:min_len]
            direction_labels = direction_labels[:min_len]
            price_targets = price_targets[:min_len]
            
            if len(features) < 50:
                return {"success": False, "error": "Insufficient data for training"}
            
            # Scale features
            features_scaled = self.scaler.fit_transform(features)
            
            # Split data
            X_train, X_test, y_dir_train, y_dir_test, y_price_train, y_price_test = train_test_split(
                features_scaled, direction_labels, price_targets,
                test_size=0.2, random_state=42
            )
            
            # Train direction classifier
            self.direction_model.fit(X_train, y_dir_train)
            direction_accuracy = self.direction_model.score(X_test, y_dir_test)
            
            # Train price regressor
            self.price_model.fit(X_train, y_price_train)
            price_r2 = self.price_model.score(X_test, y_price_test)
            
            self.is_trained = True
            
            return {
                "success": True,
                "direction_accuracy": round(direction_accuracy, 4),
                "price_r2_score": round(price_r2, 4),
                "training_samples": len(X_train),
                "test_samples": len(X_test),
                "features_used": self.feature_names
            }
            
        except Exception as e:
            logger.error(f"Training error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def predict(self, ohlcv_data: List[Dict], indicators: Dict, 
                lookback: int = 10) -> Dict:
        """Make prediction using trained models"""
        if not self.is_trained:
            return {
                "success": False,
                "error": "Model not trained. Call train() first."
            }
        
        try:
            features, _ = self.prepare_features(ohlcv_data, indicators, lookback)
            
            if len(features) == 0:
                return {"success": False, "error": "Insufficient data for prediction"}
            
            # Use latest features
            latest_features = features[-1:].reshape(1, -1)
            latest_scaled = self.scaler.transform(latest_features)
            
            # Predict direction
            direction_proba = self.direction_model.predict_proba(latest_scaled)[0]
            direction_pred = self.direction_model.predict(latest_scaled)[0]
            
            # Predict price change
            price_change_pred = self.price_model.predict(latest_scaled)[0]
            
            current_price = ohlcv_data[-1]["close"]
            predicted_price = current_price * (1 + price_change_pred / 100)
            
            return {
                "success": True,
                "direction": "UP" if direction_pred == 1 else "DOWN",
                "direction_probability": round(float(max(direction_proba)), 4),
                "up_probability": round(float(direction_proba[1]) if len(direction_proba) > 1 else direction_proba[0], 4),
                "down_probability": round(float(direction_proba[0]) if len(direction_proba) > 1 else 1 - direction_proba[0], 4),
                "predicted_price_change_pct": round(price_change_pred, 4),
                "current_price": current_price,
                "predicted_price": round(predicted_price, 2)
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_feature_importance(self) -> Dict:
        """Get feature importance from the direction model"""
        if not self.is_trained:
            return {"success": False, "error": "Model not trained"}
        
        importances = self.direction_model.feature_importances_
        feature_importance = dict(zip(self.feature_names, importances.tolist()))
        
        # Sort by importance
        sorted_importance = dict(sorted(
            feature_importance.items(), 
            key=lambda x: x[1], 
            reverse=True
        ))
        
        return {
            "success": True,
            "feature_importance": sorted_importance
        }


# Global ML engine instance
ml_engine = MLPredictionEngine()
