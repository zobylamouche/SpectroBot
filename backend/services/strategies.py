"""
Trading Strategies Module for SpectroBot
Implements various trading strategies based on technical indicators
"""
from typing import Dict, List, Optional
from enum import Enum


class Signal(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


def ema_crossover_strategy(indicators: Dict, index: int = -1) -> Signal:
    """EMA Crossover Strategy - Buy when short EMA crosses above long EMA"""
    ema_short = indicators.get("ema_short", [])
    ema_long = indicators.get("ema_long", [])
    
    if len(ema_short) < 2 or len(ema_long) < 2:
        return Signal.HOLD
    
    curr_short = ema_short[index]
    curr_long = ema_long[index]
    prev_short = ema_short[index - 1]
    prev_long = ema_long[index - 1]
    
    if curr_short is None or curr_long is None or prev_short is None or prev_long is None:
        return Signal.HOLD
    
    # Bullish crossover
    if prev_short <= prev_long and curr_short > curr_long:
        return Signal.BUY
    # Bearish crossover
    elif prev_short >= prev_long and curr_short < curr_long:
        return Signal.SELL
    
    return Signal.HOLD


def ema_rsi_strategy(indicators: Dict, index: int = -1, 
                     rsi_overbought: float = 70, rsi_oversold: float = 30) -> Signal:
    """EMA + RSI Strategy - Combines trend with momentum"""
    ema_short = indicators.get("ema_short", [])
    ema_long = indicators.get("ema_long", [])
    rsi = indicators.get("rsi", [])
    
    if not ema_short or not ema_long or not rsi:
        return Signal.HOLD
    
    curr_short = ema_short[index]
    curr_long = ema_long[index]
    curr_rsi = rsi[index]
    
    if curr_short is None or curr_long is None or curr_rsi is None:
        return Signal.HOLD
    
    # Buy: Uptrend + RSI not overbought
    if curr_short > curr_long and curr_rsi < rsi_overbought and curr_rsi > rsi_oversold:
        return Signal.BUY
    # Sell: Downtrend or RSI overbought
    elif curr_short < curr_long or curr_rsi >= rsi_overbought:
        return Signal.SELL
    # Hold in oversold territory in uptrend
    elif curr_rsi <= rsi_oversold and curr_short > curr_long:
        return Signal.BUY
    
    return Signal.HOLD


def macd_strategy(indicators: Dict, index: int = -1) -> Signal:
    """MACD Strategy - Buy on bullish crossover, sell on bearish"""
    macd_data = indicators.get("macd", {})
    macd_line = macd_data.get("macd_line", [])
    signal_line = macd_data.get("signal_line", [])
    histogram = macd_data.get("histogram", [])
    
    if len(histogram) < 2:
        return Signal.HOLD
    
    curr_hist = histogram[index]
    prev_hist = histogram[index - 1]
    
    if curr_hist is None or prev_hist is None:
        return Signal.HOLD
    
    # Bullish crossover (histogram crosses above zero)
    if prev_hist <= 0 and curr_hist > 0:
        return Signal.BUY
    # Bearish crossover
    elif prev_hist >= 0 and curr_hist < 0:
        return Signal.SELL
    
    return Signal.HOLD


def supertrend_strategy(indicators: Dict, index: int = -1) -> Signal:
    """SuperTrend Strategy - Follow the trend direction"""
    supertrend_data = indicators.get("supertrend", {})
    direction = supertrend_data.get("direction", [])
    
    if len(direction) < 2:
        return Signal.HOLD
    
    curr_dir = direction[index]
    prev_dir = direction[index - 1]
    
    if curr_dir is None or prev_dir is None:
        return Signal.HOLD
    
    # Trend reversal to bullish
    if prev_dir == -1 and curr_dir == 1:
        return Signal.BUY
    # Trend reversal to bearish
    elif prev_dir == 1 and curr_dir == -1:
        return Signal.SELL
    
    return Signal.HOLD


def composite_strategy(indicators: Dict, index: int = -1, 
                       config: Dict = None) -> Dict:
    """
    Composite Strategy - Combines multiple strategies with weights
    Returns signal and confidence score
    """
    if config is None:
        config = {
            "ema_crossover_weight": 0.25,
            "ema_rsi_weight": 0.25,
            "macd_weight": 0.25,
            "supertrend_weight": 0.25,
            "rsi_overbought": 70,
            "rsi_oversold": 30,
            "confidence_threshold": 0.6
        }
    
    signals = {
        "ema_crossover": ema_crossover_strategy(indicators, index),
        "ema_rsi": ema_rsi_strategy(indicators, index, 
                                    config["rsi_overbought"], 
                                    config["rsi_oversold"]),
        "macd": macd_strategy(indicators, index),
        "supertrend": supertrend_strategy(indicators, index)
    }
    
    # Calculate weighted score
    buy_score = 0
    sell_score = 0
    
    weights = {
        "ema_crossover": config["ema_crossover_weight"],
        "ema_rsi": config["ema_rsi_weight"],
        "macd": config["macd_weight"],
        "supertrend": config["supertrend_weight"]
    }
    
    for strategy, signal in signals.items():
        weight = weights[strategy]
        if signal == Signal.BUY:
            buy_score += weight
        elif signal == Signal.SELL:
            sell_score += weight
    
    # Determine final signal
    if buy_score >= config["confidence_threshold"]:
        final_signal = Signal.BUY
        confidence = buy_score
    elif sell_score >= config["confidence_threshold"]:
        final_signal = Signal.SELL
        confidence = sell_score
    else:
        final_signal = Signal.HOLD
        confidence = max(buy_score, sell_score)
    
    return {
        "signal": final_signal,
        "confidence": round(confidence, 3),
        "individual_signals": {k: v.value for k, v in signals.items()},
        "buy_score": round(buy_score, 3),
        "sell_score": round(sell_score, 3)
    }


def get_strategy_signal(strategy_name: str, indicators: Dict, 
                        index: int = -1, config: Dict = None) -> Dict:
    """Get signal from a specific strategy"""
    strategies = {
        "ema_crossover": lambda: {"signal": ema_crossover_strategy(indicators, index).value, "confidence": 1.0},
        "ema_rsi": lambda: {"signal": ema_rsi_strategy(indicators, index).value, "confidence": 1.0},
        "macd": lambda: {"signal": macd_strategy(indicators, index).value, "confidence": 1.0},
        "supertrend": lambda: {"signal": supertrend_strategy(indicators, index).value, "confidence": 1.0},
        "composite": lambda: {**composite_strategy(indicators, index, config), "signal": composite_strategy(indicators, index, config)["signal"].value}
    }
    
    if strategy_name in strategies:
        return strategies[strategy_name]()
    
    return {"signal": Signal.HOLD.value, "confidence": 0, "error": "Unknown strategy"}
