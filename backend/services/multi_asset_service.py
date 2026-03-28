"""
Multi-Asset Market Data Service for SpectroBot
Supports Crypto (Binance), Stocks, Commodities via various APIs
"""
import os
import asyncio
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import aiohttp
import random

logger = logging.getLogger(__name__)

# Asset Categories
ASSET_TYPES = {
    "crypto": "Cryptocurrency",
    "stock": "Stock",
    "commodity": "Commodity",
    "forex": "Forex",
    "index": "Index"
}

# Only crypto currently has a real-time provider implemented.
REALTIME_ASSET_TYPES = {
    "crypto": ASSET_TYPES["crypto"]
}

# Default assets by category
DEFAULT_ASSETS = {
    "crypto": [
        {"symbol": "BTCUSDT", "name": "Bitcoin", "currency": "USDT"},
        {"symbol": "ETHUSDT", "name": "Ethereum", "currency": "USDT"},
        {"symbol": "BNBUSDT", "name": "Binance Coin", "currency": "USDT"},
        {"symbol": "SOLUSDT", "name": "Solana", "currency": "USDT"},
        {"symbol": "XRPUSDT", "name": "Ripple", "currency": "USDT"},
    ],
    "stock": [
        {"symbol": "GOOGL", "name": "Alphabet (Google)", "currency": "USD"},
        {"symbol": "TSLA", "name": "Tesla", "currency": "USD"},
        {"symbol": "AAPL", "name": "Apple", "currency": "USD"},
        {"symbol": "MSFT", "name": "Microsoft", "currency": "USD"},
        {"symbol": "AMZN", "name": "Amazon", "currency": "USD"},
        {"symbol": "NVDA", "name": "NVIDIA", "currency": "USD"},
        {"symbol": "META", "name": "Meta (Facebook)", "currency": "USD"},
    ],
    "commodity": [
        {"symbol": "XAUUSD", "name": "Gold", "currency": "USD"},
        {"symbol": "XAGUSD", "name": "Silver", "currency": "USD"},
        {"symbol": "XPTUSD", "name": "Platinum", "currency": "USD"},
        {"symbol": "COPPERUSD", "name": "Copper", "currency": "USD"},
        {"symbol": "OILUSD", "name": "Crude Oil (WTI)", "currency": "USD"},
        {"symbol": "GASUSD", "name": "Natural Gas", "currency": "USD"},
    ],
    "forex": [
        {"symbol": "EURUSD", "name": "Euro/US Dollar", "currency": "USD"},
        {"symbol": "GBPUSD", "name": "British Pound/US Dollar", "currency": "USD"},
        {"symbol": "USDJPY", "name": "US Dollar/Japanese Yen", "currency": "JPY"},
    ],
    "index": [
        {"symbol": "SPX500", "name": "S&P 500", "currency": "USD"},
        {"symbol": "NAS100", "name": "Nasdaq 100", "currency": "USD"},
        {"symbol": "DJI30", "name": "Dow Jones 30", "currency": "USD"},
    ]
}

# Simulated base prices for non-crypto assets
SIMULATED_PRICES = {
    # Stocks
    "GOOGL": 178.50,
    "TSLA": 248.30,
    "AAPL": 195.20,
    "MSFT": 425.80,
    "AMZN": 185.60,
    "NVDA": 495.20,
    "META": 520.40,
    # Commodities
    "XAUUSD": 2650.50,
    "XAGUSD": 31.25,
    "XPTUSD": 985.40,
    "COPPERUSD": 4.35,
    "OILUSD": 72.80,
    "GASUSD": 2.85,
    # Forex
    "EURUSD": 1.0875,
    "GBPUSD": 1.2720,
    "USDJPY": 157.25,
    # Indices
    "SPX500": 5950.00,
    "NAS100": 21250.00,
    "DJI30": 43500.00,
}

# Price history for simulation
price_history = {}


class MultiAssetService:
    """Service for handling multiple asset types"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.custom_assets: Dict[str, List[Dict]] = {}
        self.crypto_ticker_cache: Dict[str, Dict] = {}
        self._initialize_price_history()
    
    def _initialize_price_history(self):
        """Initialize price history for simulated assets"""
        global price_history
        for symbol, base_price in SIMULATED_PRICES.items():
            if symbol not in price_history:
                price_history[symbol] = {
                    "price": base_price,
                    "last_update": datetime.utcnow()
                }
    
    async def get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
    
    def get_asset_type(self, symbol: str) -> str:
        """Determine asset type from symbol"""
        symbol = symbol.upper()
        
        # Check if it's a crypto pair (ends with USDT, BTC, etc.)
        if symbol.endswith(("USDT", "BTC", "ETH", "BNB")):
            return "crypto"
        
        # Check commodities
        if symbol in ["XAUUSD", "XAGUSD", "XPTUSD", "COPPERUSD", "OILUSD", "GASUSD"]:
            return "commodity"
        
        # Check forex
        if symbol in ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD"]:
            return "forex"
        
        # Check indices
        if symbol in ["SPX500", "NAS100", "DJI30"]:
            return "index"
        
        # Default to stock
        return "stock"
    
    def _simulate_price_movement(self, symbol: str) -> Dict:
        """Generate realistic price movements for simulated assets"""
        global price_history
        
        if symbol not in price_history:
            base_price = SIMULATED_PRICES.get(symbol, 100.0)
            price_history[symbol] = {
                "price": base_price,
                "last_update": datetime.utcnow()
            }
        
        current = price_history[symbol]
        base_price = current["price"]
        
        # Volatility based on asset type
        asset_type = self.get_asset_type(symbol)
        volatility = {
            "crypto": 0.02,
            "stock": 0.008,
            "commodity": 0.005,
            "forex": 0.002,
            "index": 0.006
        }.get(asset_type, 0.01)
        
        # Random walk with mean reversion
        change_pct = random.gauss(0, volatility)
        new_price = base_price * (1 + change_pct)
        
        # Keep price positive and realistic
        original_price = SIMULATED_PRICES.get(symbol, 100.0)
        if new_price < original_price * 0.7:
            new_price = original_price * 0.7
        elif new_price > original_price * 1.3:
            new_price = original_price * 1.3
        
        price_history[symbol]["price"] = new_price
        price_history[symbol]["last_update"] = datetime.utcnow()
        
        # Calculate 24h change (simulated)
        daily_change = random.gauss(0, volatility * 3)
        
        return {
            "price": round(new_price, 4 if asset_type == "forex" else 2),
            "price_change": round(new_price * daily_change, 4),
            "price_change_pct": round(daily_change * 100, 2),
            "high_24h": round(new_price * (1 + abs(daily_change) + 0.01), 2),
            "low_24h": round(new_price * (1 - abs(daily_change) - 0.01), 2),
            "volume_24h": round(random.uniform(1000000, 50000000), 2)
        }
    
    async def get_asset_price(self, symbol: str) -> Dict:
        """Get current price for any asset type"""
        symbol = symbol.upper()
        asset_type = self.get_asset_type(symbol)

        if asset_type != "crypto":
            return {
                "success": False,
                "error": f"No real-time provider configured for asset type '{asset_type}'"
            }
        
        try:
            session = await self.get_session()
            url = f"https://api.binance.com/api/v3/ticker/price"
            params = {"symbol": symbol}

            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "symbol": symbol,
                        "name": self._get_asset_name(symbol),
                        "type": asset_type,
                        "price": float(data["price"]),
                        "currency": "USDT",
                        "data_source": "binance",
                        "timestamp": datetime.utcnow().isoformat()
                    }

                error = await response.text()
                return {
                    "success": False,
                    "error": f"Binance price error {response.status}: {error}"
                }
        except asyncio.TimeoutError:
            return {"success": False, "error": f"Timeout fetching {symbol}"}
        except Exception as e:
            logger.error(f"Error fetching price for {symbol}: {str(e)}")
            return {"success": False, "error": str(e)}

    async def get_asset_ticker(self, symbol: str) -> Dict:
        """Get 24h ticker for any asset"""
        symbol = symbol.upper()
        asset_type = self.get_asset_type(symbol)

        if asset_type != "crypto":
            return {
                "success": False,
                "error": f"No real-time provider configured for asset type '{asset_type}'"
            }

        try:
            session = await self.get_session()
            url = f"https://api.binance.com/api/v3/ticker/24hr"
            params = {"symbol": symbol}

            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "symbol": symbol,
                        "name": self._get_asset_name(symbol),
                        "type": asset_type,
                        "price": float(data["lastPrice"]),
                        "price_change": float(data["priceChange"]),
                        "price_change_pct": float(data["priceChangePercent"]),
                        "high_24h": float(data["highPrice"]),
                        "low_24h": float(data["lowPrice"]),
                        "volume_24h": float(data["volume"]),
                        "currency": "USDT",
                        "data_source": "binance",
                        "timestamp": datetime.utcnow().isoformat()
                    }

                error = await response.text()
                return {
                    "success": False,
                    "error": f"Binance ticker error {response.status}: {error}"
                }
        except asyncio.TimeoutError:
            logger.error(f"Timeout fetching ticker for {symbol}")
            return {"success": False, "error": f"Timeout fetching {symbol}"}
        except Exception as e:
            logger.error(f"Error fetching ticker for {symbol}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_klines(self, symbol: str, interval: str = "1h", limit: int = 100) -> List[Dict]:
        """Generate OHLCV klines for any asset"""
        symbol = symbol.upper()
        asset_type = self.get_asset_type(symbol)

        if asset_type != "crypto":
            return []
        
        # For crypto, try Binance first
        try:
            session = await self.get_session()
            url = f"https://api.binance.com/api/v3/klines"
            params = {
                "symbol": symbol,
                "interval": interval,
                "limit": limit
            }

            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    klines = []
                    for k in data:
                        klines.append({
                            "timestamp": k[0],
                            "open": float(k[1]),
                            "high": float(k[2]),
                            "low": float(k[3]),
                            "close": float(k[4]),
                            "volume": float(k[5])
                        })
                    return klines
        except Exception as e:
            logger.error(f"Binance klines error: {str(e)}")

        return []
    
    def _generate_simulated_klines(self, symbol: str, interval: str, limit: int) -> List[Dict]:
        """Generate simulated historical klines"""
        base_price = SIMULATED_PRICES.get(symbol, price_history.get(symbol, {}).get("price", 100.0))
        if isinstance(base_price, dict):
            base_price = base_price.get("price", 100.0)
        
        asset_type = self.get_asset_type(symbol)
        volatility = {
            "crypto": 0.015,
            "stock": 0.008,
            "commodity": 0.006,
            "forex": 0.002,
            "index": 0.005
        }.get(asset_type, 0.01)
        
        # Interval to minutes
        interval_minutes = {
            "1m": 1, "5m": 5, "15m": 15, "30m": 30,
            "1h": 60, "4h": 240, "1d": 1440, "1w": 10080
        }.get(interval, 60)
        
        klines = []
        current_time = datetime.utcnow()
        price = base_price
        
        for i in range(limit, 0, -1):
            timestamp = current_time - timedelta(minutes=interval_minutes * i)
            
            # Generate OHLCV
            change = random.gauss(0, volatility)
            open_price = price
            close_price = open_price * (1 + change)
            high_price = max(open_price, close_price) * (1 + random.uniform(0, volatility))
            low_price = min(open_price, close_price) * (1 - random.uniform(0, volatility))
            volume = random.uniform(100000, 5000000)
            
            klines.append({
                "timestamp": int(timestamp.timestamp() * 1000),
                "open": round(open_price, 2),
                "high": round(high_price, 2),
                "low": round(low_price, 2),
                "close": round(close_price, 2),
                "volume": round(volume, 2)
            })
            
            price = close_price
        
        return klines
    
    def _get_asset_name(self, symbol: str) -> str:
        """Get human-readable name for asset"""
        symbol = symbol.upper()
        
        # Check all default assets
        for category, assets in DEFAULT_ASSETS.items():
            for asset in assets:
                if asset["symbol"] == symbol:
                    return asset["name"]
        
        # Check custom assets
        for category, assets in self.custom_assets.items():
            for asset in assets:
                if asset["symbol"] == symbol:
                    return asset["name"]
        
        return symbol
    
    def get_all_available_assets(self) -> Dict[str, List[Dict]]:
        """Get all available assets by category"""
        result = {
            "crypto": list(DEFAULT_ASSETS.get("crypto", []))
        }
        
        # Add custom crypto assets only.
        if "crypto" in self.custom_assets:
            result["crypto"].extend(self.custom_assets["crypto"])
        
        return result
    
    def add_custom_asset(self, symbol: str, name: str, asset_type: str, currency: str = "USD", base_price: float = None) -> Dict:
        """Add a custom asset"""
        symbol = symbol.upper()

        if asset_type != "crypto":
            return {
                "success": False,
                "error": "Only crypto assets are supported in real-time mode"
            }
        
        if asset_type not in self.custom_assets:
            self.custom_assets[asset_type] = []
        
        # Check if already exists
        for asset in self.custom_assets[asset_type]:
            if asset["symbol"] == symbol:
                return {"success": False, "error": "Asset already exists"}
        
        new_asset = {
            "symbol": symbol,
            "name": name,
            "currency": currency,
            "custom": True
        }
        
        self.custom_assets[asset_type].append(new_asset)
        
        return {"success": True, "asset": new_asset}
    
    def remove_custom_asset(self, symbol: str) -> Dict:
        """Remove a custom asset"""
        symbol = symbol.upper()
        
        for category, assets in self.custom_assets.items():
            for i, asset in enumerate(assets):
                if asset["symbol"] == symbol:
                    del self.custom_assets[category][i]
                    return {"success": True}
        
        return {"success": False, "error": "Asset not found"}


# Global instance
multi_asset_service = MultiAssetService()
