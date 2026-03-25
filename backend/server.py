"""
SpectroBot - Professional Algorithmic Trading Platform
FastAPI Backend Server
"""
from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import os
import uuid
import logging
import asyncio
import json
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import services
from services.indicators import calculate_all_indicators
from services.strategies import get_strategy_signal
from services.ml_engine import ml_engine
from services.llm_service import analyze_market_with_llm, explain_trading_decision
from services.backtesting import run_backtest, optimize_parameters
from services.binance_service import market_service
from services.multi_asset_service import multi_asset_service, DEFAULT_ASSETS, ASSET_TYPES
from version import get_version_info, APP_VERSION

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

# Price stream callback
async def price_update_callback(price_data: dict):
    await ws_manager.broadcast({
        "type": "price_update",
        "data": price_data
    })

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("SpectroBot starting up...")
    market_service.register_price_callback(price_update_callback)
    
    # Start price stream in background
    asyncio.create_task(market_service.start_price_stream(["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]))
    
    yield
    
    # Shutdown
    logger.info("SpectroBot shutting down...")
    await market_service.stop_price_stream()
    await market_service.close()
    client.close()

# Create FastAPI app
app = FastAPI(
    title="SpectroBot API",
    description="Professional Algorithmic Trading Platform",
    version=APP_VERSION,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class PortfolioCreate(BaseModel):
    name: str = "Default Portfolio"
    initial_capital: float = 10000
    currency: str = "USDT"

class Portfolio(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    initial_capital: float
    current_capital: float
    currency: str
    positions: Dict[str, Any] = {}
    total_pnl: float = 0
    total_pnl_pct: float = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TradeCreate(BaseModel):
    portfolio_id: str
    symbol: str
    side: str  # BUY or SELL
    quantity: float
    price: float
    strategy: Optional[str] = None

class Trade(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    portfolio_id: str
    symbol: str
    side: str
    quantity: float
    price: float
    value: float
    fee: float
    strategy: Optional[str]
    signal_confidence: Optional[float]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class IndicatorConfig(BaseModel):
    ema_short: int = 9
    ema_long: int = 21
    ema_trend: int = 50
    rsi_period: int = 14
    macd_fast: int = 12
    macd_slow: int = 26
    macd_signal: int = 9
    atr_period: int = 14
    supertrend_period: int = 10
    supertrend_multiplier: float = 3.0

class StrategyConfig(BaseModel):
    strategy_name: str = "composite"
    rsi_overbought: float = 70
    rsi_oversold: float = 30
    confidence_threshold: float = 0.6
    ema_crossover_weight: float = 0.25
    ema_rsi_weight: float = 0.25
    macd_weight: float = 0.25
    supertrend_weight: float = 0.25

class BacktestRequest(BaseModel):
    symbol: str = "BTCUSDT"
    interval: str = "1h"
    limit: int = 500
    strategy_name: str = "composite"
    initial_capital: float = 10000
    position_size_pct: float = 10
    trading_fee_pct: float = 0.1
    stop_loss_pct: Optional[float] = None
    take_profit_pct: Optional[float] = None
    indicator_config: Optional[IndicatorConfig] = None
    strategy_config: Optional[StrategyConfig] = None

class AIAnalysisRequest(BaseModel):
    symbol: str = "BTCUSDT"
    include_ml: bool = True
    include_llm: bool = True
    language: str = "English"  # English, French, Spanish, German

class Settings(BaseModel):
    id: str = "default"
    indicator_config: IndicatorConfig = IndicatorConfig()
    strategy_config: StrategyConfig = StrategyConfig()
    risk_config: Dict[str, Any] = {
        "max_position_size_pct": 20,
        "stop_loss_pct": 5,
        "take_profit_pct": 10,
        "max_daily_loss_pct": 10
    }
    ai_config: Dict[str, Any] = {
        "ml_enabled": True,
        "llm_enabled": True,
        "confidence_threshold": 0.7,
        "prediction_horizon": 5
    }
    watchlist: List[str] = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"]
    trading_mode: str = "simulation"  # simulation or live
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CustomAssetCreate(BaseModel):
    symbol: str
    name: str
    asset_type: str  # crypto, stock, commodity, forex, index
    currency: str = "USD"
    base_price: Optional[float] = None

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {
        "name": "SpectroBot API",
        "version": "1.0.0",
        "status": "running"
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/version")
async def get_app_version():
    """Get application version information"""
    return get_version_info()

# ==================== ASSETS MANAGEMENT ====================

@api_router.get("/assets/types")
async def get_asset_types():
    """Get all available asset types"""
    return {"types": ASSET_TYPES}

@api_router.get("/assets/all")
async def get_all_assets():
    """Get all available assets grouped by type"""
    return {
        "assets": multi_asset_service.get_all_available_assets(),
        "types": ASSET_TYPES
    }

@api_router.get("/assets/default")
async def get_default_assets():
    """Get default assets by category"""
    return {"assets": DEFAULT_ASSETS}

@api_router.post("/assets/custom")
async def add_custom_asset(asset: CustomAssetCreate):
    """Add a custom asset to track"""
    result = multi_asset_service.add_custom_asset(
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type,
        currency=asset.currency,
        base_price=asset.base_price
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    # Save to database
    await db.custom_assets.update_one(
        {"symbol": asset.symbol.upper()},
        {"$set": {
            "symbol": asset.symbol.upper(),
            "name": asset.name,
            "asset_type": asset.asset_type,
            "currency": asset.currency,
            "base_price": asset.base_price,
            "created_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return result

@api_router.delete("/assets/custom/{symbol}")
async def remove_custom_asset(symbol: str):
    """Remove a custom asset"""
    result = multi_asset_service.remove_custom_asset(symbol)
    await db.custom_assets.delete_one({"symbol": symbol.upper()})
    return result

@api_router.get("/assets/ticker/{symbol}")
async def get_asset_ticker(symbol: str):
    """Get ticker for any asset type (crypto, stock, commodity, etc.)"""
    result = await multi_asset_service.get_asset_ticker(symbol.upper())
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@api_router.get("/assets/klines/{symbol}")
async def get_asset_klines(
    symbol: str,
    interval: str = "1h",
    limit: int = Query(default=100, le=1000)
):
    """Get historical klines for any asset type"""
    klines = await multi_asset_service.generate_klines(symbol.upper(), interval, limit)
    return {
        "success": True,
        "symbol": symbol.upper(),
        "interval": interval,
        "klines": klines
    }

@api_router.get("/watchlist")
async def get_watchlist():
    """Get user's watchlist"""
    settings = await db.settings.find_one({"id": "default"}, {"_id": 0})
    if settings and "watchlist" in settings:
        return {"watchlist": settings["watchlist"]}
    return {"watchlist": ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"]}

@api_router.post("/watchlist")
async def update_watchlist(watchlist: List[str]):
    """Update user's watchlist"""
    await db.settings.update_one(
        {"id": "default"},
        {"$set": {"watchlist": watchlist}},
        upsert=True
    )
    return {"success": True, "watchlist": watchlist}

# ==================== MARKET DATA ====================

@api_router.get("/market/price/{symbol}")
async def get_price(symbol: str):
    """Get current price for a symbol"""
    result = await market_service.get_current_price(symbol.upper())
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@api_router.get("/market/ticker/{symbol}")
async def get_ticker(symbol: str):
    """Get 24h ticker for a symbol"""
    result = await market_service.get_24h_ticker(symbol.upper())
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@api_router.get("/market/klines/{symbol}")
async def get_klines(
    symbol: str,
    interval: str = "1h",
    limit: int = Query(default=100, le=1000)
):
    """Get historical klines/candlestick data"""
    result = await market_service.get_klines(symbol.upper(), interval, limit)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@api_router.get("/market/symbols")
async def get_symbols():
    """Get all available trading symbols"""
    result = await market_service.get_all_symbols()
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

# ==================== INDICATORS ====================

@api_router.post("/indicators/calculate")
async def calculate_indicators(
    symbol: str = "BTCUSDT",
    interval: str = "1h",
    limit: int = 100,
    config: Optional[IndicatorConfig] = None
):
    """Calculate technical indicators for a symbol"""
    # Get klines
    klines_result = await market_service.get_klines(symbol.upper(), interval, limit)
    if not klines_result.get("success"):
        raise HTTPException(status_code=400, detail=klines_result.get("error"))
    
    ohlcv_data = klines_result["data"]
    config_dict = config.model_dump() if config else None
    
    indicators = calculate_all_indicators(ohlcv_data, config_dict)
    
    # Get only last N values for response
    last_n = 50
    return {
        "symbol": symbol,
        "interval": interval,
        "data_points": len(ohlcv_data),
        "indicators": {
            "ema_short": indicators["ema_short"][-last_n:],
            "ema_long": indicators["ema_long"][-last_n:],
            "ema_trend": indicators["ema_trend"][-last_n:],
            "rsi": indicators["rsi"][-last_n:],
            "macd": {
                "macd_line": indicators["macd"]["macd_line"][-last_n:],
                "signal_line": indicators["macd"]["signal_line"][-last_n:],
                "histogram": indicators["macd"]["histogram"][-last_n:]
            },
            "atr": indicators["atr"][-last_n:],
            "supertrend": {
                "supertrend": indicators["supertrend"]["supertrend"][-last_n:],
                "direction": indicators["supertrend"]["direction"][-last_n:]
            }
        },
        "prices": [d["close"] for d in ohlcv_data[-last_n:]],
        "timestamps": [d["timestamp"] for d in ohlcv_data[-last_n:]]
    }

# ==================== STRATEGIES ====================

@api_router.post("/strategies/signal")
async def get_signal(
    symbol: str = "BTCUSDT",
    interval: str = "1h",
    limit: int = 100,
    strategy_name: str = "composite",
    strategy_config: Optional[StrategyConfig] = None
):
    """Get trading signal from a strategy"""
    # Get klines
    klines_result = await market_service.get_klines(symbol.upper(), interval, limit)
    if not klines_result.get("success"):
        raise HTTPException(status_code=400, detail=klines_result.get("error"))
    
    ohlcv_data = klines_result["data"]
    indicators = calculate_all_indicators(ohlcv_data)
    
    config_dict = strategy_config.model_dump() if strategy_config else None
    signal_result = get_strategy_signal(strategy_name, indicators, -1, config_dict)
    
    current_price = ohlcv_data[-1]["close"]
    
    return {
        "symbol": symbol,
        "interval": interval,
        "strategy": strategy_name,
        "current_price": current_price,
        "signal": signal_result,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/strategies/list")
async def list_strategies():
    """List available trading strategies"""
    return {
        "strategies": [
            {
                "name": "ema_crossover",
                "description": "Buy when short EMA crosses above long EMA, sell on opposite",
                "indicators": ["EMA Short", "EMA Long"]
            },
            {
                "name": "ema_rsi",
                "description": "EMA trend + RSI momentum filter",
                "indicators": ["EMA Short", "EMA Long", "RSI"]
            },
            {
                "name": "macd",
                "description": "MACD histogram crossover signals",
                "indicators": ["MACD Line", "Signal Line", "Histogram"]
            },
            {
                "name": "supertrend",
                "description": "Follow SuperTrend direction changes",
                "indicators": ["SuperTrend", "ATR"]
            },
            {
                "name": "composite",
                "description": "Combines all strategies with weighted voting",
                "indicators": ["All"]
            }
        ]
    }

# ==================== ML PREDICTION ====================

@api_router.post("/ml/train")
async def train_ml_model(
    symbol: str = "BTCUSDT",
    interval: str = "1h",
    limit: int = 500,
    horizon: int = 5
):
    """Train ML model on historical data"""
    # Get klines
    klines_result = await market_service.get_klines(symbol.upper(), interval, limit)
    if not klines_result.get("success"):
        raise HTTPException(status_code=400, detail=klines_result.get("error"))
    
    ohlcv_data = klines_result["data"]
    indicators = calculate_all_indicators(ohlcv_data)
    
    result = ml_engine.train(ohlcv_data, indicators, horizon)
    
    return {
        "symbol": symbol,
        "interval": interval,
        "training_result": result
    }

@api_router.post("/ml/predict")
async def ml_predict(
    symbol: str = "BTCUSDT",
    interval: str = "1h",
    limit: int = 100
):
    """Get ML prediction for price direction"""
    # Get klines
    klines_result = await market_service.get_klines(symbol.upper(), interval, limit)
    if not klines_result.get("success"):
        raise HTTPException(status_code=400, detail=klines_result.get("error"))
    
    ohlcv_data = klines_result["data"]
    indicators = calculate_all_indicators(ohlcv_data)
    
    prediction = ml_engine.predict(ohlcv_data, indicators)
    
    return {
        "symbol": symbol,
        "interval": interval,
        "prediction": prediction,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/ml/feature-importance")
async def get_feature_importance():
    """Get feature importance from trained ML model"""
    return ml_engine.get_feature_importance()

# ==================== AI ANALYSIS ====================

@api_router.post("/ai/analyze")
async def ai_analyze(request: AIAnalysisRequest):
    """Get comprehensive AI analysis"""
    symbol = request.symbol.upper()
    
    # Get market data
    ticker_result = await market_service.get_24h_ticker(symbol)
    if not ticker_result.get("success"):
        raise HTTPException(status_code=400, detail=ticker_result.get("error"))
    
    klines_result = await market_service.get_klines(symbol, "1h", 100)
    if not klines_result.get("success"):
        raise HTTPException(status_code=400, detail=klines_result.get("error"))
    
    ohlcv_data = klines_result["data"]
    indicators = calculate_all_indicators(ohlcv_data)
    
    # Get strategy signal
    strategy_signal = get_strategy_signal("composite", indicators)
    
    result = {
        "symbol": symbol,
        "current_price": ticker_result["price"],
        "price_change_24h": ticker_result["price_change_pct"],
        "strategy_signal": strategy_signal,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # ML prediction
    if request.include_ml:
        ml_prediction = ml_engine.predict(ohlcv_data, indicators)
        result["ml_prediction"] = ml_prediction
    else:
        ml_prediction = {}
    
    # LLM analysis
    if request.include_llm:
        llm_result = await analyze_market_with_llm(
            symbol=symbol,
            current_price=ticker_result["price"],
            price_change_24h=ticker_result["price_change_pct"],
            indicators=indicators,
            ml_prediction=ml_prediction,
            strategy_signal=strategy_signal,
            language=request.language
        )
        result["llm_analysis"] = llm_result
    
    return result

# ==================== BACKTESTING ====================

@api_router.post("/backtest/run")
async def run_backtest_endpoint(request: BacktestRequest):
    """Run backtest simulation"""
    # Get klines
    klines_result = await market_service.get_klines(
        request.symbol.upper(), 
        request.interval, 
        request.limit
    )
    if not klines_result.get("success"):
        raise HTTPException(status_code=400, detail=klines_result.get("error"))
    
    ohlcv_data = klines_result["data"]
    
    indicator_config = request.indicator_config.model_dump() if request.indicator_config else None
    strategy_config = request.strategy_config.model_dump() if request.strategy_config else None
    
    result = run_backtest(
        ohlcv_data=ohlcv_data,
        strategy_name=request.strategy_name,
        initial_capital=request.initial_capital,
        position_size_pct=request.position_size_pct,
        trading_fee_pct=request.trading_fee_pct,
        stop_loss_pct=request.stop_loss_pct,
        take_profit_pct=request.take_profit_pct,
        indicator_config=indicator_config,
        strategy_config=strategy_config
    )
    
    return result

@api_router.post("/backtest/optimize")
async def optimize_backtest(
    symbol: str = "BTCUSDT",
    interval: str = "1h",
    limit: int = 500,
    strategy_name: str = "composite",
    optimization_target: str = "sharpe_ratio"
):
    """Optimize strategy parameters"""
    # Get klines
    klines_result = await market_service.get_klines(symbol.upper(), interval, limit)
    if not klines_result.get("success"):
        raise HTTPException(status_code=400, detail=klines_result.get("error"))
    
    ohlcv_data = klines_result["data"]
    
    # Define parameter ranges to test
    param_ranges = {
        "ema_short": [5, 9, 12],
        "ema_long": [18, 21, 26],
        "rsi_overbought": [65, 70, 75],
        "rsi_oversold": [25, 30, 35],
        "position_size_pct": [5, 10, 15]
    }
    
    result = optimize_parameters(
        ohlcv_data=ohlcv_data,
        strategy_name=strategy_name,
        param_ranges=param_ranges,
        optimization_target=optimization_target
    )
    
    return result

# ==================== PORTFOLIO ====================

@api_router.post("/portfolio/create", response_model=Portfolio)
async def create_portfolio(portfolio: PortfolioCreate):
    """Create a new portfolio"""
    portfolio_obj = Portfolio(
        name=portfolio.name,
        initial_capital=portfolio.initial_capital,
        current_capital=portfolio.initial_capital,
        currency=portfolio.currency
    )
    
    doc = portfolio_obj.model_dump()
    await db.portfolios.insert_one(doc)
    
    return portfolio_obj

@api_router.get("/portfolio/{portfolio_id}")
async def get_portfolio(portfolio_id: str):
    """Get portfolio by ID"""
    portfolio = await db.portfolios.find_one({"id": portfolio_id}, {"_id": 0})
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@api_router.get("/portfolios")
async def list_portfolios():
    """List all portfolios"""
    portfolios = await db.portfolios.find({}, {"_id": 0}).to_list(100)
    return {"portfolios": portfolios}

@api_router.post("/portfolio/{portfolio_id}/trade")
async def execute_trade(portfolio_id: str, trade: TradeCreate):
    """Execute a trade in a portfolio"""
    portfolio = await db.portfolios.find_one({"id": portfolio_id}, {"_id": 0})
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    fee_rate = 0.001  # 0.1% fee
    trade_value = trade.quantity * trade.price
    fee = trade_value * fee_rate
    
    if trade.side.upper() == "BUY":
        total_cost = trade_value + fee
        if total_cost > portfolio["current_capital"]:
            raise HTTPException(status_code=400, detail="Insufficient capital")
        
        # Update capital
        new_capital = portfolio["current_capital"] - total_cost
        
        # Update positions
        positions = portfolio.get("positions", {})
        if trade.symbol in positions:
            positions[trade.symbol]["quantity"] += trade.quantity
            positions[trade.symbol]["avg_price"] = (
                (positions[trade.symbol]["avg_price"] * (positions[trade.symbol]["quantity"] - trade.quantity) +
                 trade.price * trade.quantity) / positions[trade.symbol]["quantity"]
            )
        else:
            positions[trade.symbol] = {
                "quantity": trade.quantity,
                "avg_price": trade.price
            }
    else:  # SELL
        positions = portfolio.get("positions", {})
        if trade.symbol not in positions or positions[trade.symbol]["quantity"] < trade.quantity:
            raise HTTPException(status_code=400, detail="Insufficient position")
        
        # Calculate PnL
        entry_price = positions[trade.symbol]["avg_price"]
        pnl = (trade.price - entry_price) * trade.quantity - fee
        
        # Update capital
        new_capital = portfolio["current_capital"] + trade_value - fee
        
        # Update positions
        positions[trade.symbol]["quantity"] -= trade.quantity
        if positions[trade.symbol]["quantity"] <= 0:
            del positions[trade.symbol]
    
    # Create trade record
    trade_record = Trade(
        portfolio_id=portfolio_id,
        symbol=trade.symbol,
        side=trade.side.upper(),
        quantity=trade.quantity,
        price=trade.price,
        value=trade_value,
        fee=fee,
        strategy=trade.strategy,
        signal_confidence=None
    )
    
    # Save trade
    await db.trades.insert_one(trade_record.model_dump())
    
    # Update portfolio
    total_pnl = new_capital - portfolio["initial_capital"]
    total_pnl_pct = (total_pnl / portfolio["initial_capital"]) * 100
    
    await db.portfolios.update_one(
        {"id": portfolio_id},
        {
            "$set": {
                "current_capital": new_capital,
                "positions": positions,
                "total_pnl": total_pnl,
                "total_pnl_pct": total_pnl_pct,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "trade": trade_record.model_dump(),
        "updated_capital": new_capital,
        "positions": positions
    }

@api_router.get("/portfolio/{portfolio_id}/trades")
async def get_portfolio_trades(portfolio_id: str, limit: int = 50):
    """Get trade history for a portfolio"""
    trades = await db.trades.find(
        {"portfolio_id": portfolio_id}, 
        {"_id": 0}
    ).sort("timestamp", -1).to_list(limit)
    
    return {"trades": trades}

# ==================== SETTINGS ====================

@api_router.get("/settings")
async def get_settings():
    """Get current settings"""
    settings = await db.settings.find_one({"id": "default"}, {"_id": 0})
    if not settings:
        # Create default settings
        default_settings = Settings()
        await db.settings.insert_one(default_settings.model_dump())
        return default_settings.model_dump()
    return settings

@api_router.put("/settings")
async def update_settings(settings: Settings):
    """Update settings"""
    settings.updated_at = datetime.now(timezone.utc).isoformat()
    
    await db.settings.update_one(
        {"id": "default"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    
    return settings

# ==================== WEBSOCKET ====================

@app.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    """WebSocket endpoint for real-time price updates"""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Handle any incoming messages (e.g., subscribe to specific symbols)
            if data:
                try:
                    msg = json.loads(data)
                    if msg.get("action") == "ping":
                        await websocket.send_json({"type": "pong"})
                except json.JSONDecodeError:
                    pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        ws_manager.disconnect(websocket)

# Include router
app.include_router(api_router)
