# SpectroBot Version Configuration
# Semantic Versioning: MAJOR.MINOR.PATCH

APP_VERSION = "1.0.0"
APP_NAME = "SpectroBot"
BUILD_DATE = "2025-12-25"
CHANGELOG = {
    "1.0.0": {
        "date": "2025-12-25",
        "changes": [
            "Initial MVP release",
            "Real-time market data via Binance API",
            "Technical indicators (EMA, RSI, MACD, ATR, SuperTrend)",
            "Multiple trading strategies with composite signals",
            "ML-based price prediction (RandomForest, GradientBoosting)",
            "AI analysis powered by GPT-5.2",
            "Advanced backtesting with equity curves",
            "Virtual portfolio management",
            "Multi-language support (FR, EN, ES, DE)",
            "Dynamic AI analysis translation"
        ]
    }
}

def get_version_info():
    """Return complete version information"""
    return {
        "version": APP_VERSION,
        "name": APP_NAME,
        "build_date": BUILD_DATE,
        "changelog": CHANGELOG
    }
