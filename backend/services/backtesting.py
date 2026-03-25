"""
Backtesting Engine for SpectroBot
Simulates trading strategies on historical data
"""
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum
import numpy as np
from services.indicators import calculate_all_indicators
from services.strategies import get_strategy_signal, Signal


class BacktestResult:
    """Container for backtest results"""
    def __init__(self):
        self.trades: List[Dict] = []
        self.equity_curve: List[float] = []
        self.timestamps: List[str] = []
        self.metrics: Dict = {}


def run_backtest(
    ohlcv_data: List[Dict],
    strategy_name: str = "composite",
    initial_capital: float = 10000,
    position_size_pct: float = 10,
    trading_fee_pct: float = 0.1,
    stop_loss_pct: Optional[float] = None,
    take_profit_pct: Optional[float] = None,
    indicator_config: Dict = None,
    strategy_config: Dict = None
) -> Dict:
    """
    Run backtest simulation on historical data
    
    Args:
        ohlcv_data: List of OHLCV dictionaries with timestamp, open, high, low, close, volume
        strategy_name: Name of strategy to use
        initial_capital: Starting capital
        position_size_pct: Percentage of capital per trade
        trading_fee_pct: Trading fee percentage
        stop_loss_pct: Stop loss percentage (optional)
        take_profit_pct: Take profit percentage (optional)
        indicator_config: Configuration for indicators
        strategy_config: Configuration for strategy
    """
    if len(ohlcv_data) < 50:
        return {"success": False, "error": "Insufficient data for backtesting (min 50 candles)"}
    
    # Calculate indicators
    indicators = calculate_all_indicators(ohlcv_data, indicator_config)
    
    # Initialize backtest state
    capital = initial_capital
    position = 0  # Number of units held
    entry_price = 0
    trades = []
    equity_curve = [initial_capital]
    timestamps = [ohlcv_data[0].get("timestamp", "")]
    
    # Track metrics
    total_trades = 0
    winning_trades = 0
    losing_trades = 0
    gross_profit = 0
    gross_loss = 0
    max_drawdown = 0
    peak_equity = initial_capital
    
    # Start from index where indicators are valid (usually after ~50 candles)
    start_index = 50
    
    for i in range(start_index, len(ohlcv_data)):
        current_price = ohlcv_data[i]["close"]
        current_high = ohlcv_data[i]["high"]
        current_low = ohlcv_data[i]["low"]
        timestamp = ohlcv_data[i].get("timestamp", str(i))
        
        # Check stop loss / take profit if in position
        if position > 0:
            # Stop loss
            if stop_loss_pct and current_low <= entry_price * (1 - stop_loss_pct / 100):
                exit_price = entry_price * (1 - stop_loss_pct / 100)
                pnl = (exit_price - entry_price) * position
                fee = abs(exit_price * position) * (trading_fee_pct / 100)
                net_pnl = pnl - fee
                capital += position * exit_price - fee
                
                trades.append({
                    "type": "SELL",
                    "reason": "STOP_LOSS",
                    "entry_price": entry_price,
                    "exit_price": exit_price,
                    "quantity": position,
                    "pnl": net_pnl,
                    "pnl_pct": (net_pnl / (entry_price * position)) * 100,
                    "timestamp": timestamp
                })
                
                if net_pnl > 0:
                    winning_trades += 1
                    gross_profit += net_pnl
                else:
                    losing_trades += 1
                    gross_loss += abs(net_pnl)
                
                total_trades += 1
                position = 0
                entry_price = 0
            
            # Take profit
            elif take_profit_pct and current_high >= entry_price * (1 + take_profit_pct / 100):
                exit_price = entry_price * (1 + take_profit_pct / 100)
                pnl = (exit_price - entry_price) * position
                fee = abs(exit_price * position) * (trading_fee_pct / 100)
                net_pnl = pnl - fee
                capital += position * exit_price - fee
                
                trades.append({
                    "type": "SELL",
                    "reason": "TAKE_PROFIT",
                    "entry_price": entry_price,
                    "exit_price": exit_price,
                    "quantity": position,
                    "pnl": net_pnl,
                    "pnl_pct": (net_pnl / (entry_price * position)) * 100,
                    "timestamp": timestamp
                })
                
                winning_trades += 1
                gross_profit += net_pnl
                total_trades += 1
                position = 0
                entry_price = 0
        
        # Get strategy signal
        signal_result = get_strategy_signal(strategy_name, indicators, i, strategy_config)
        signal = signal_result.get("signal", "HOLD")
        
        # Execute trades based on signal
        if signal == "BUY" and position == 0:
            # Calculate position size
            trade_value = capital * (position_size_pct / 100)
            quantity = trade_value / current_price
            fee = trade_value * (trading_fee_pct / 100)
            
            if trade_value + fee <= capital:
                capital -= (trade_value + fee)
                position = quantity
                entry_price = current_price
                
                trades.append({
                    "type": "BUY",
                    "reason": "SIGNAL",
                    "price": current_price,
                    "quantity": quantity,
                    "value": trade_value,
                    "fee": fee,
                    "timestamp": timestamp
                })
        
        elif signal == "SELL" and position > 0:
            # Close position
            exit_value = position * current_price
            fee = exit_value * (trading_fee_pct / 100)
            pnl = (current_price - entry_price) * position
            net_pnl = pnl - fee
            capital += exit_value - fee
            
            trades.append({
                "type": "SELL",
                "reason": "SIGNAL",
                "entry_price": entry_price,
                "exit_price": current_price,
                "quantity": position,
                "pnl": net_pnl,
                "pnl_pct": (net_pnl / (entry_price * position)) * 100,
                "timestamp": timestamp
            })
            
            if net_pnl > 0:
                winning_trades += 1
                gross_profit += net_pnl
            else:
                losing_trades += 1
                gross_loss += abs(net_pnl)
            
            total_trades += 1
            position = 0
            entry_price = 0
        
        # Calculate current equity
        current_equity = capital + (position * current_price if position > 0 else 0)
        equity_curve.append(current_equity)
        timestamps.append(timestamp)
        
        # Track drawdown
        if current_equity > peak_equity:
            peak_equity = current_equity
        drawdown = (peak_equity - current_equity) / peak_equity * 100
        if drawdown > max_drawdown:
            max_drawdown = drawdown
    
    # Close any remaining position
    if position > 0:
        final_price = ohlcv_data[-1]["close"]
        exit_value = position * final_price
        fee = exit_value * (trading_fee_pct / 100)
        pnl = (final_price - entry_price) * position
        net_pnl = pnl - fee
        capital += exit_value - fee
        
        trades.append({
            "type": "SELL",
            "reason": "END_OF_DATA",
            "entry_price": entry_price,
            "exit_price": final_price,
            "quantity": position,
            "pnl": net_pnl,
            "pnl_pct": (net_pnl / (entry_price * position)) * 100,
            "timestamp": ohlcv_data[-1].get("timestamp", "")
        })
        
        if net_pnl > 0:
            winning_trades += 1
            gross_profit += net_pnl
        else:
            losing_trades += 1
            gross_loss += abs(net_pnl)
        total_trades += 1
    
    final_equity = capital
    
    # Calculate metrics
    net_profit = final_equity - initial_capital
    net_profit_pct = (net_profit / initial_capital) * 100
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else float('inf')
    avg_win = (gross_profit / winning_trades) if winning_trades > 0 else 0
    avg_loss = (gross_loss / losing_trades) if losing_trades > 0 else 0
    
    # Calculate Sharpe and Sortino ratios
    returns = np.diff(equity_curve) / equity_curve[:-1]
    if len(returns) > 1:
        avg_return = np.mean(returns)
        std_return = np.std(returns)
        sharpe_ratio = (avg_return / std_return * np.sqrt(252)) if std_return > 0 else 0
        
        # Sortino: only downside deviation
        downside_returns = returns[returns < 0]
        downside_std = np.std(downside_returns) if len(downside_returns) > 0 else 0
        sortino_ratio = (avg_return / downside_std * np.sqrt(252)) if downside_std > 0 else 0
    else:
        sharpe_ratio = 0
        sortino_ratio = 0
    
    return {
        "success": True,
        "metrics": {
            "initial_capital": initial_capital,
            "final_equity": round(final_equity, 2),
            "net_profit": round(net_profit, 2),
            "net_profit_pct": round(net_profit_pct, 2),
            "total_trades": total_trades,
            "winning_trades": winning_trades,
            "losing_trades": losing_trades,
            "win_rate": round(win_rate, 2),
            "profit_factor": round(profit_factor, 2) if profit_factor != float('inf') else "∞",
            "avg_win": round(avg_win, 2),
            "avg_loss": round(avg_loss, 2),
            "max_drawdown_pct": round(max_drawdown, 2),
            "sharpe_ratio": round(sharpe_ratio, 3),
            "sortino_ratio": round(sortino_ratio, 3)
        },
        "trades": trades,
        "equity_curve": [round(e, 2) for e in equity_curve],
        "timestamps": timestamps,
        "strategy": strategy_name,
        "config": {
            "position_size_pct": position_size_pct,
            "trading_fee_pct": trading_fee_pct,
            "stop_loss_pct": stop_loss_pct,
            "take_profit_pct": take_profit_pct
        }
    }


def optimize_parameters(
    ohlcv_data: List[Dict],
    strategy_name: str,
    param_ranges: Dict,
    initial_capital: float = 10000,
    optimization_target: str = "sharpe_ratio"
) -> Dict:
    """
    Optimize strategy parameters by testing different combinations
    
    Args:
        param_ranges: Dict of parameter names to list of values to test
        optimization_target: Metric to optimize (sharpe_ratio, net_profit_pct, win_rate)
    """
    best_result = None
    best_score = float('-inf')
    all_results = []
    
    # Simple grid search (for MVP - could be expanded to genetic algo)
    from itertools import product
    
    param_names = list(param_ranges.keys())
    param_values = list(param_ranges.values())
    
    for combo in product(*param_values):
        config = dict(zip(param_names, combo))
        
        # Map config to indicator/strategy config
        indicator_config = {
            "ema_short": config.get("ema_short", 9),
            "ema_long": config.get("ema_long", 21),
            "ema_trend": config.get("ema_trend", 50),
            "rsi_period": config.get("rsi_period", 14),
            "macd_fast": config.get("macd_fast", 12),
            "macd_slow": config.get("macd_slow", 26),
            "macd_signal": config.get("macd_signal", 9),
            "atr_period": config.get("atr_period", 14),
            "supertrend_period": config.get("supertrend_period", 10),
            "supertrend_multiplier": config.get("supertrend_multiplier", 3.0)
        }
        
        strategy_config = {
            "rsi_overbought": config.get("rsi_overbought", 70),
            "rsi_oversold": config.get("rsi_oversold", 30),
            "confidence_threshold": config.get("confidence_threshold", 0.6)
        }
        
        result = run_backtest(
            ohlcv_data=ohlcv_data,
            strategy_name=strategy_name,
            initial_capital=initial_capital,
            position_size_pct=config.get("position_size_pct", 10),
            stop_loss_pct=config.get("stop_loss_pct"),
            take_profit_pct=config.get("take_profit_pct"),
            indicator_config=indicator_config,
            strategy_config=strategy_config
        )
        
        if result.get("success"):
            metrics = result["metrics"]
            score = metrics.get(optimization_target, 0)
            
            if isinstance(score, str):  # Handle "∞" for profit_factor
                score = 999
            
            all_results.append({
                "config": config,
                "score": score,
                "metrics": metrics
            })
            
            if score > best_score:
                best_score = score
                best_result = {
                    "config": config,
                    "metrics": metrics
                }
    
    return {
        "success": True,
        "best_result": best_result,
        "optimization_target": optimization_target,
        "total_combinations_tested": len(all_results),
        "top_10_results": sorted(all_results, key=lambda x: x["score"], reverse=True)[:10]
    }
