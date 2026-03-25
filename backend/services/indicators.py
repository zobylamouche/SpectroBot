"""
Technical Indicators Module for SpectroBot
Implements EMA, RSI, MACD, ATR, SuperTrend
"""
import numpy as np
from typing import List, Dict, Tuple
import pandas as pd


def calculate_ema(prices: List[float], period: int) -> List[float]:
    """Calculate Exponential Moving Average"""
    if len(prices) < period:
        return [None] * len(prices)
    
    ema = []
    multiplier = 2 / (period + 1)
    
    # First EMA is SMA
    sma = sum(prices[:period]) / period
    ema = [None] * (period - 1) + [sma]
    
    for price in prices[period:]:
        ema.append((price - ema[-1]) * multiplier + ema[-1])
    
    return ema


def calculate_rsi(prices: List[float], period: int = 14) -> List[float]:
    """Calculate Relative Strength Index"""
    if len(prices) < period + 1:
        return [None] * len(prices)
    
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    avg_gain = np.mean(gains[:period])
    avg_loss = np.mean(losses[:period])
    
    rsi = [None] * period
    
    for i in range(period, len(prices)):
        if i > period:
            avg_gain = (avg_gain * (period - 1) + gains[i - 1]) / period
            avg_loss = (avg_loss * (period - 1) + losses[i - 1]) / period
        
        if avg_loss == 0:
            rsi.append(100)
        else:
            rs = avg_gain / avg_loss
            rsi.append(100 - (100 / (1 + rs)))
    
    return rsi


def calculate_macd(prices: List[float], fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, List[float]]:
    """Calculate MACD Line, Signal Line, and Histogram"""
    ema_fast = calculate_ema(prices, fast)
    ema_slow = calculate_ema(prices, slow)
    
    macd_line = []
    for i in range(len(prices)):
        if ema_fast[i] is not None and ema_slow[i] is not None:
            macd_line.append(ema_fast[i] - ema_slow[i])
        else:
            macd_line.append(None)
    
    # Filter out None values for signal calculation
    valid_macd = [v for v in macd_line if v is not None]
    signal_line_values = calculate_ema(valid_macd, signal) if len(valid_macd) >= signal else []
    
    # Reconstruct signal line with proper indices
    signal_line = [None] * (len(macd_line) - len(signal_line_values)) + signal_line_values
    
    histogram = []
    for i in range(len(prices)):
        if macd_line[i] is not None and signal_line[i] is not None:
            histogram.append(macd_line[i] - signal_line[i])
        else:
            histogram.append(None)
    
    return {
        "macd_line": macd_line,
        "signal_line": signal_line,
        "histogram": histogram
    }


def calculate_atr(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> List[float]:
    """Calculate Average True Range"""
    if len(highs) < period + 1:
        return [None] * len(highs)
    
    true_ranges = [highs[0] - lows[0]]
    
    for i in range(1, len(highs)):
        tr1 = highs[i] - lows[i]
        tr2 = abs(highs[i] - closes[i - 1])
        tr3 = abs(lows[i] - closes[i - 1])
        true_ranges.append(max(tr1, tr2, tr3))
    
    atr = [None] * (period - 1)
    atr.append(sum(true_ranges[:period]) / period)
    
    for i in range(period, len(true_ranges)):
        atr.append((atr[-1] * (period - 1) + true_ranges[i]) / period)
    
    return atr


def calculate_supertrend(highs: List[float], lows: List[float], closes: List[float], 
                         period: int = 10, multiplier: float = 3.0) -> Dict[str, List]:
    """Calculate SuperTrend indicator"""
    atr = calculate_atr(highs, lows, closes, period)
    
    supertrend = []
    direction = []  # 1 = bullish, -1 = bearish
    
    upper_band = []
    lower_band = []
    
    for i in range(len(closes)):
        if atr[i] is None:
            supertrend.append(None)
            direction.append(None)
            upper_band.append(None)
            lower_band.append(None)
            continue
        
        hl2 = (highs[i] + lows[i]) / 2
        basic_upper = hl2 + (multiplier * atr[i])
        basic_lower = hl2 - (multiplier * atr[i])
        
        if i == 0 or upper_band[-1] is None:
            final_upper = basic_upper
            final_lower = basic_lower
        else:
            final_upper = basic_upper if basic_upper < upper_band[-1] or closes[i - 1] > upper_band[-1] else upper_band[-1]
            final_lower = basic_lower if basic_lower > lower_band[-1] or closes[i - 1] < lower_band[-1] else lower_band[-1]
        
        upper_band.append(final_upper)
        lower_band.append(final_lower)
        
        if i == 0 or supertrend[-1] is None:
            supertrend.append(final_upper)
            direction.append(-1)
        elif supertrend[-1] == upper_band[-2]:
            if closes[i] > final_upper:
                supertrend.append(final_lower)
                direction.append(1)
            else:
                supertrend.append(final_upper)
                direction.append(-1)
        else:
            if closes[i] < final_lower:
                supertrend.append(final_upper)
                direction.append(-1)
            else:
                supertrend.append(final_lower)
                direction.append(1)
    
    return {
        "supertrend": supertrend,
        "direction": direction,
        "upper_band": upper_band,
        "lower_band": lower_band
    }


def calculate_all_indicators(ohlcv_data: List[Dict], config: Dict = None) -> Dict:
    """Calculate all indicators for given OHLCV data"""
    if config is None:
        config = {
            "ema_short": 9,
            "ema_long": 21,
            "ema_trend": 50,
            "rsi_period": 14,
            "macd_fast": 12,
            "macd_slow": 26,
            "macd_signal": 9,
            "atr_period": 14,
            "supertrend_period": 10,
            "supertrend_multiplier": 3.0
        }
    
    closes = [d["close"] for d in ohlcv_data]
    highs = [d["high"] for d in ohlcv_data]
    lows = [d["low"] for d in ohlcv_data]
    
    return {
        "ema_short": calculate_ema(closes, config["ema_short"]),
        "ema_long": calculate_ema(closes, config["ema_long"]),
        "ema_trend": calculate_ema(closes, config["ema_trend"]),
        "rsi": calculate_rsi(closes, config["rsi_period"]),
        "macd": calculate_macd(closes, config["macd_fast"], config["macd_slow"], config["macd_signal"]),
        "atr": calculate_atr(highs, lows, closes, config["atr_period"]),
        "supertrend": calculate_supertrend(highs, lows, closes, config["supertrend_period"], config["supertrend_multiplier"])
    }
