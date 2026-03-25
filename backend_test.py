#!/usr/bin/env python3
"""
SpectroBot Backend API Testing Suite
Tests all API endpoints for the trading platform
"""
import requests
import sys
import json
import os
from datetime import datetime
from typing import Dict, Any

class SpectrobotAPITester:
    def __init__(self, base_url=None):
        base_url = base_url or os.environ.get("SPECTROBOT_BASE_URL", "http://localhost:8001")
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.portfolio_id = None

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, data: Dict = None, timeout: int = 30) -> tuple:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout after {timeout}s")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        # Root endpoint
        self.run_test("Root API", "GET", "", 200)
        
        # Health check
        self.run_test("Health Check", "GET", "health", 200)

    def test_market_data_endpoints(self):
        """Test market data endpoints"""
        print("\n" + "="*50)
        print("TESTING MARKET DATA ENDPOINTS")
        print("="*50)
        
        # Test ticker endpoint (mentioned in requirements)
        success, data = self.run_test("BTC Ticker", "GET", "market/ticker/BTCUSDT", 200)
        if success and data:
            print(f"   BTC Price: ${data.get('price', 'N/A')}")
        
        # Test current price
        self.run_test("BTC Current Price", "GET", "market/price/BTCUSDT", 200)
        
        # Test klines
        self.run_test("BTC Klines", "GET", "market/klines/BTCUSDT?interval=1h&limit=50", 200)
        
        # Test symbols
        self.run_test("Available Symbols", "GET", "market/symbols", 200)

    def test_indicators_endpoint(self):
        """Test technical indicators"""
        print("\n" + "="*50)
        print("TESTING INDICATORS ENDPOINT")
        print("="*50)
        
        success, data = self.run_test(
            "Calculate Indicators", 
            "POST", 
            "indicators/calculate?symbol=BTCUSDT&interval=1h&limit=100", 
            200
        )
        
        if success and data:
            indicators = data.get('indicators', {})
            print(f"   RSI values: {len(indicators.get('rsi', []))} points")
            print(f"   EMA values: {len(indicators.get('ema_short', []))} points")

    def test_strategies_endpoint(self):
        """Test trading strategies (mentioned in requirements)"""
        print("\n" + "="*50)
        print("TESTING STRATEGIES ENDPOINT")
        print("="*50)
        
        # Test strategy signal (mentioned in requirements)
        success, data = self.run_test(
            "Strategy Signal", 
            "POST", 
            "strategies/signal?symbol=BTCUSDT&interval=1h&strategy_name=composite", 
            200,
            timeout=45
        )
        
        if success and data:
            signal = data.get('signal', {})
            print(f"   Signal: {signal.get('action', 'N/A')}")
            print(f"   Confidence: {signal.get('confidence', 'N/A')}")
        
        # List available strategies
        self.run_test("List Strategies", "GET", "strategies/list", 200)

    def test_ml_endpoints(self):
        """Test ML prediction endpoints"""
        print("\n" + "="*50)
        print("TESTING ML ENDPOINTS")
        print("="*50)
        
        # Train ML model (with longer timeout for training)
        success, data = self.run_test(
            "Train ML Model", 
            "POST", 
            "ml/train?symbol=BTCUSDT&interval=1h&limit=200&horizon=5", 
            200,
            timeout=60
        )
        
        if success:
            # Test ML prediction
            success, pred_data = self.run_test(
                "ML Prediction", 
                "POST", 
                "ml/predict?symbol=BTCUSDT&interval=1h&limit=100", 
                200,
                timeout=30
            )
            
            if success and pred_data:
                prediction = pred_data.get('prediction', {})
                print(f"   Prediction: {prediction.get('direction', 'N/A')}")
                print(f"   Confidence: {prediction.get('confidence', 'N/A')}")
        
        # Feature importance
        self.run_test("Feature Importance", "GET", "ml/feature-importance", 200)

    def test_ai_analysis_endpoint(self):
        """Test AI analysis with LLM"""
        print("\n" + "="*50)
        print("TESTING AI ANALYSIS ENDPOINT")
        print("="*50)
        
        success, data = self.run_test(
            "AI Analysis", 
            "POST", 
            "ai/analyze", 
            200,
            data={
                "symbol": "BTCUSDT",
                "include_ml": True,
                "include_llm": True
            },
            timeout=60
        )
        
        if success and data:
            print(f"   Current Price: ${data.get('current_price', 'N/A')}")
            print(f"   24h Change: {data.get('price_change_24h', 'N/A')}%")
            if 'llm_analysis' in data:
                print(f"   LLM Analysis Available: Yes")
            if 'ml_prediction' in data:
                print(f"   ML Prediction Available: Yes")

    def test_backtest_endpoint(self):
        """Test backtesting endpoint (mentioned in requirements)"""
        print("\n" + "="*50)
        print("TESTING BACKTEST ENDPOINT")
        print("="*50)
        
        backtest_config = {
            "symbol": "BTCUSDT",
            "interval": "1h",
            "limit": 200,
            "strategy_name": "composite",
            "initial_capital": 10000,
            "position_size_pct": 10,
            "trading_fee_pct": 0.1
        }
        
        success, data = self.run_test(
            "Run Backtest", 
            "POST", 
            "backtest/run", 
            200,
            data=backtest_config,
            timeout=60
        )
        
        if success and data:
            metrics = data.get('metrics', {})
            print(f"   Net Profit: ${metrics.get('net_profit', 'N/A')}")
            print(f"   Win Rate: {metrics.get('win_rate', 'N/A')}%")
            print(f"   Total Trades: {len(data.get('trades', []))}")

    def test_portfolio_endpoints(self):
        """Test virtual portfolio endpoints"""
        print("\n" + "="*50)
        print("TESTING PORTFOLIO ENDPOINTS")
        print("="*50)
        
        # Create portfolio
        success, data = self.run_test(
            "Create Portfolio", 
            "POST", 
            "portfolio/create", 
            200,
            data={
                "name": f"Test Portfolio {datetime.now().strftime('%H%M%S')}",
                "initial_capital": 10000,
                "currency": "USDT"
            }
        )
        
        if success and data:
            self.portfolio_id = data.get('id')
            print(f"   Portfolio ID: {self.portfolio_id}")
            
            # Get portfolio
            self.run_test(
                "Get Portfolio", 
                "GET", 
                f"portfolio/{self.portfolio_id}", 
                200
            )
            
            # List portfolios
            self.run_test("List Portfolios", "GET", "portfolios", 200)
            
            # Execute a test trade
            trade_data = {
                "portfolio_id": self.portfolio_id,
                "symbol": "BTCUSDT",
                "side": "BUY",
                "quantity": 0.001,
                "price": 50000,
                "strategy": "test"
            }
            
            success, trade_result = self.run_test(
                "Execute Trade", 
                "POST", 
                f"portfolio/{self.portfolio_id}/trade", 
                200,
                data=trade_data
            )
            
            if success:
                # Get trade history
                self.run_test(
                    "Get Trade History", 
                    "GET", 
                    f"portfolio/{self.portfolio_id}/trades", 
                    200
                )

    def test_settings_endpoint(self):
        """Test settings endpoints"""
        print("\n" + "="*50)
        print("TESTING SETTINGS ENDPOINT")
        print("="*50)
        
        # Get settings
        success, data = self.run_test("Get Settings", "GET", "settings", 200)
        
        if success and data:
            # Update settings
            updated_settings = data.copy()
            updated_settings['trading_mode'] = 'simulation'
            
            self.run_test(
                "Update Settings", 
                "PUT", 
                "settings", 
                200,
                data=updated_settings
            )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting SpectroBot API Tests")
        print(f"Backend URL: {self.base_url}")
        
        try:
            self.test_health_endpoints()
            self.test_market_data_endpoints()
            self.test_indicators_endpoint()
            self.test_strategies_endpoint()
            self.test_ml_endpoints()
            self.test_ai_analysis_endpoint()
            self.test_backtest_endpoint()
            self.test_portfolio_endpoints()
            self.test_settings_endpoint()
            
        except KeyboardInterrupt:
            print("\n⚠️ Tests interrupted by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {str(e)}")
        
        # Print results
        print("\n" + "="*50)
        print("TEST RESULTS")
        print("="*50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️ Some tests failed")
            return 1

def main():
    tester = SpectrobotAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())