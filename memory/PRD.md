# SpectroBot - PRD (Product Requirements Document)

## Original Problem Statement
Professional algorithmic trading platform (SpectroBot) for:
- Cryptocurrency trading with Binance API
- Technical indicators (EMA, RSI, MACD, ATR, SuperTrend)
- Multiple modular trading strategies
- AI/ML predictions and optimization
- Advanced backtesting with performance metrics
- Real-time trading with WebSocket
- Professional dark-themed UI

## User Choices
- **Data Source**: Binance API (simulated for demo)
- **Market Type**: Crypto (BTC, ETH, BNB, SOL, XRP)
- **AI Integration**: Hybrid (Local ML + OpenAI API)
- **Trading Mode**: Simulation by default (virtual capital)

## Architecture
- **Backend**: FastAPI (Python) + MongoDB
- **Frontend**: React + Tailwind CSS + Recharts
- **Data**: Simulated Binance market data with realistic price movements

## What's Been Implemented

### Version 1.0.0 (December 25, 2025)

#### Backend Services
- `/api/market/price/{symbol}` - Current price
- `/api/market/ticker/{symbol}` - 24h stats
- `/api/market/klines/{symbol}` - Historical OHLCV data
- `/api/indicators/calculate` - Technical indicators calculation
- `/api/strategies/signal` - Trading signals
- `/api/ml/train` - ML model training
- `/api/ml/predict` - ML predictions
- `/api/ai/analyze` - LLM market analysis (with language parameter)
- `/api/backtest/run` - Backtest simulation
- `/api/portfolio/*` - Virtual portfolio management
- `/api/settings` - Configuration persistence
- `/api/version` - Application version information

#### Technical Indicators
- EMA (Short: 9, Long: 21, Trend: 50)
- RSI (14 period)
- MACD (12/26/9)
- ATR (14 period)
- SuperTrend (10 period, 3x multiplier)

#### Trading Strategies
- EMA Crossover
- EMA + RSI Momentum
- MACD Histogram
- SuperTrend Direction
- Composite (weighted combination)

#### Frontend Pages
- **Dashboard**: Real-time prices, charts, signals, portfolio
- **Trading**: Execute trades, view positions
- **Backtest**: Run simulations with equity curves
- **Settings**: Configure all parameters

#### ML Engine
- RandomForest classifier for direction prediction
- GradientBoosting regressor for price prediction
- Feature engineering from price and indicators

#### Multi-Language Support
- French (FR)
- English (EN)
- Spanish (ES)
- German (DE)
- Dynamic AI analysis translation based on selected language

#### Versioning System
- Semantic versioning (MAJOR.MINOR.PATCH)
- Version endpoint API
- Footer with version display
- Changelog dialog with release notes

## P0 Features (Completed)
- [x] Real-time price display
- [x] Technical indicators calculation
- [x] Strategy signals
- [x] Backtesting engine
- [x] Virtual portfolio
- [x] Dark theme UI
- [x] Multi-language support (FR, EN, ES, DE)
- [x] AI analysis translation
- [x] Version system with changelog

## P1 Features (Backlog)
- [ ] Connect to real Binance WebSocket (currently using HTTP polling)
- [ ] Paper trading automation
- [ ] Alert notifications (email/push)
- [ ] Export backtest reports

## P2 Features (Future)
- [ ] Real broker integration
- [ ] Multi-timeframe analysis
- [ ] Custom strategy builder
- [ ] Social trading features

## Known Limitations
- **WebSocket**: Currently using HTTP polling (2s interval) instead of WebSocket due to K8s ingress routing (needs `/api` prefix)
- **Trading**: Simulation mode only - no real trading execution

## Next Action Items
1. Implement real-time automated trading execution
2. Add email/notification alerts for price levels
3. Fix WebSocket implementation with proper `/api/ws/...` routing
4. Add more cryptocurrency pairs

## Technical Notes
- Backend: FastAPI on port 8001
- Frontend: React on port 3000
- Database: MongoDB
- LLM: OpenAI API
- All API routes prefixed with `/api`
