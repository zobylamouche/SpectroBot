"""
Binance Market Data Service for SpectroBot
Handles historical data fetching and WebSocket streaming
"""
import os
import asyncio
import json
import logging
from typing import Dict, List, Optional, Callable
from datetime import datetime, timedelta
import aiohttp
import websockets

logger = logging.getLogger(__name__)

# Binance API endpoints
BINANCE_REST_URL = "https://api.binance.com"
BINANCE_WS_URL = "wss://stream.binance.com:9443/ws"

# Supported intervals
INTERVALS = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
    "1w": "1w"
}


class BinanceService:
    """Service for interacting with Binance API"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.ws_connection = None
        self.price_callbacks: List[Callable] = []
        self.running = False
    
    async def get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
        self.running = False
    
    async def get_current_price(self, symbol: str = "BTCUSDT") -> Dict:
        """Get current price for a symbol"""
        try:
            session = await self.get_session()
            url = f"{BINANCE_REST_URL}/api/v3/ticker/price"
            params = {"symbol": symbol.upper()}
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "symbol": data["symbol"],
                        "price": float(data["price"]),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                else:
                    error = await response.text()
                    return {"success": False, "error": error}
        except Exception as e:
            logger.error(f"Error fetching price: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_24h_ticker(self, symbol: str = "BTCUSDT") -> Dict:
        """Get 24h ticker stats"""
        try:
            session = await self.get_session()
            url = f"{BINANCE_REST_URL}/api/v3/ticker/24hr"
            params = {"symbol": symbol.upper()}
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "symbol": data["symbol"],
                        "price": float(data["lastPrice"]),
                        "price_change": float(data["priceChange"]),
                        "price_change_pct": float(data["priceChangePercent"]),
                        "high_24h": float(data["highPrice"]),
                        "low_24h": float(data["lowPrice"]),
                        "volume_24h": float(data["volume"]),
                        "quote_volume_24h": float(data["quoteVolume"]),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                else:
                    error = await response.text()
                    return {"success": False, "error": error}
        except Exception as e:
            logger.error(f"Error fetching 24h ticker: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_klines(
        self, 
        symbol: str = "BTCUSDT",
        interval: str = "1h",
        limit: int = 100,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> Dict:
        """Get historical klines/candlestick data"""
        try:
            session = await self.get_session()
            url = f"{BINANCE_REST_URL}/api/v3/klines"
            
            params = {
                "symbol": symbol.upper(),
                "interval": interval,
                "limit": min(limit, 1000)  # Binance max is 1000
            }
            
            if start_time:
                params["startTime"] = start_time
            if end_time:
                params["endTime"] = end_time
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Convert to OHLCV format
                    ohlcv = []
                    for k in data:
                        ohlcv.append({
                            "timestamp": k[0],  # Open time in ms
                            "open": float(k[1]),
                            "high": float(k[2]),
                            "low": float(k[3]),
                            "close": float(k[4]),
                            "volume": float(k[5]),
                            "close_time": k[6],
                            "quote_volume": float(k[7]),
                            "trades": int(k[8])
                        })
                    
                    return {
                        "success": True,
                        "symbol": symbol,
                        "interval": interval,
                        "data": ohlcv
                    }
                else:
                    error = await response.text()
                    return {"success": False, "error": error}
        except Exception as e:
            logger.error(f"Error fetching klines: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_all_symbols(self) -> Dict:
        """Get all available trading symbols"""
        try:
            session = await self.get_session()
            url = f"{BINANCE_REST_URL}/api/v3/exchangeInfo"
            
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    symbols = [
                        {
                            "symbol": s["symbol"],
                            "base": s["baseAsset"],
                            "quote": s["quoteAsset"],
                            "status": s["status"]
                        }
                        for s in data["symbols"]
                        if s["quoteAsset"] == "USDT" and s["status"] == "TRADING"
                    ]
                    return {
                        "success": True,
                        "symbols": symbols[:100]  # Limit to 100 for performance
                    }
                else:
                    error = await response.text()
                    return {"success": False, "error": error}
        except Exception as e:
            logger.error(f"Error fetching symbols: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def register_price_callback(self, callback: Callable):
        """Register a callback for price updates"""
        self.price_callbacks.append(callback)
    
    async def start_price_stream(self, symbols: List[str] = None):
        """Start WebSocket price stream"""
        if symbols is None:
            symbols = ["btcusdt", "ethusdt"]
        
        streams = "/".join([f"{s.lower()}@ticker" for s in symbols])
        ws_url = f"{BINANCE_WS_URL}/{streams}"
        
        self.running = True
        
        while self.running:
            try:
                async with websockets.connect(ws_url) as websocket:
                    logger.info(f"Connected to Binance WebSocket: {streams}")
                    
                    async for message in websocket:
                        if not self.running:
                            break
                        
                        data = json.loads(message)
                        
                        price_data = {
                            "symbol": data.get("s", ""),
                            "price": float(data.get("c", 0)),
                            "price_change": float(data.get("p", 0)),
                            "price_change_pct": float(data.get("P", 0)),
                            "high_24h": float(data.get("h", 0)),
                            "low_24h": float(data.get("l", 0)),
                            "volume": float(data.get("v", 0)),
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        
                        # Notify all callbacks
                        for callback in self.price_callbacks:
                            try:
                                await callback(price_data)
                            except Exception as e:
                                logger.error(f"Callback error: {str(e)}")
                        
            except websockets.ConnectionClosed:
                logger.warning("WebSocket connection closed, reconnecting...")
                await asyncio.sleep(5)
            except Exception as e:
                logger.error(f"WebSocket error: {str(e)}")
                await asyncio.sleep(5)
    
    async def stop_price_stream(self):
        """Stop WebSocket price stream"""
        self.running = False


# Singleton instance
binance_service = BinanceService()


# For simulated/demo mode when Binance is not available
class SimulatedMarketService:
    """Simulated market data for demo/testing"""
    
    def __init__(self):
        self.base_prices = {
            "BTCUSDT": 95000,
            "ETHUSDT": 3500,
            "BNBUSDT": 650,
            "SOLUSDT": 180,
            "XRPUSDT": 2.5
        }
        self.running = False
        self.price_callbacks: List[Callable] = []
    
    async def get_current_price(self, symbol: str = "BTCUSDT") -> Dict:
        import random
        base = self.base_prices.get(symbol, 100)
        price = base * (1 + random.uniform(-0.02, 0.02))
        return {
            "success": True,
            "symbol": symbol,
            "price": round(price, 2),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_24h_ticker(self, symbol: str = "BTCUSDT") -> Dict:
        import random
        base = self.base_prices.get(symbol, 100)
        price = base * (1 + random.uniform(-0.02, 0.02))
        change_pct = random.uniform(-5, 5)
        return {
            "success": True,
            "symbol": symbol,
            "price": round(price, 2),
            "price_change": round(price * change_pct / 100, 2),
            "price_change_pct": round(change_pct, 2),
            "high_24h": round(price * 1.03, 2),
            "low_24h": round(price * 0.97, 2),
            "volume_24h": round(random.uniform(1000, 50000), 2),
            "quote_volume_24h": round(random.uniform(100000000, 500000000), 2),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_klines(
        self, 
        symbol: str = "BTCUSDT",
        interval: str = "1h",
        limit: int = 100,
        **kwargs
    ) -> Dict:
        """Generate simulated historical data"""
        import random
        
        base = self.base_prices.get(symbol, 100)
        ohlcv = []
        current_time = datetime.utcnow()
        
        # Interval to minutes
        interval_minutes = {
            "1m": 1, "5m": 5, "15m": 15, "30m": 30,
            "1h": 60, "4h": 240, "1d": 1440, "1w": 10080
        }
        minutes = interval_minutes.get(interval, 60)
        
        price = base
        for i in range(limit):
            timestamp = current_time - timedelta(minutes=minutes * (limit - i - 1))
            
            # Random walk
            change = random.uniform(-0.02, 0.02)
            price = price * (1 + change)
            
            high = price * (1 + random.uniform(0, 0.01))
            low = price * (1 - random.uniform(0, 0.01))
            open_price = price * (1 + random.uniform(-0.005, 0.005))
            
            ohlcv.append({
                "timestamp": int(timestamp.timestamp() * 1000),
                "open": round(open_price, 2),
                "high": round(high, 2),
                "low": round(low, 2),
                "close": round(price, 2),
                "volume": round(random.uniform(100, 1000), 2),
                "close_time": int((timestamp + timedelta(minutes=minutes)).timestamp() * 1000),
                "quote_volume": round(random.uniform(10000, 100000), 2),
                "trades": random.randint(100, 5000)
            })
        
        return {
            "success": True,
            "symbol": symbol,
            "interval": interval,
            "data": ohlcv
        }
    
    async def get_all_symbols(self) -> Dict:
        return {
            "success": True,
            "symbols": [
                {"symbol": "BTCUSDT", "base": "BTC", "quote": "USDT", "status": "TRADING"},
                {"symbol": "ETHUSDT", "base": "ETH", "quote": "USDT", "status": "TRADING"},
                {"symbol": "BNBUSDT", "base": "BNB", "quote": "USDT", "status": "TRADING"},
                {"symbol": "SOLUSDT", "base": "SOL", "quote": "USDT", "status": "TRADING"},
                {"symbol": "XRPUSDT", "base": "XRP", "quote": "USDT", "status": "TRADING"}
            ]
        }
    
    def register_price_callback(self, callback: Callable):
        self.price_callbacks.append(callback)
    
    async def start_price_stream(self, symbols: List[str] = None):
        """Simulate price stream"""
        import random
        
        if symbols is None:
            symbols = ["BTCUSDT", "ETHUSDT"]
        
        self.running = True
        
        while self.running:
            for symbol in symbols:
                base = self.base_prices.get(symbol, 100)
                # Add some randomness
                self.base_prices[symbol] = base * (1 + random.uniform(-0.001, 0.001))
                
                price_data = {
                    "symbol": symbol,
                    "price": round(self.base_prices[symbol], 2),
                    "price_change": round(random.uniform(-100, 100), 2),
                    "price_change_pct": round(random.uniform(-2, 2), 2),
                    "high_24h": round(self.base_prices[symbol] * 1.03, 2),
                    "low_24h": round(self.base_prices[symbol] * 0.97, 2),
                    "volume": round(random.uniform(1000, 50000), 2),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                for callback in self.price_callbacks:
                    try:
                        await callback(price_data)
                    except Exception as e:
                        logger.error(f"Callback error: {str(e)}")
            
            await asyncio.sleep(2)  # Update every 2 seconds
    
    async def stop_price_stream(self):
        self.running = False
    
    async def close(self):
        self.running = False


# Use simulated service by default (can be switched to binance_service)
market_service = SimulatedMarketService()
