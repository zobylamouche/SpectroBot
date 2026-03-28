import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../config/api';

const API = API_BASE;
const LIVE_DEFAULT_WATCHLIST = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];

const isLiveCryptoSymbol = (symbol) => typeof symbol === 'string' && symbol.toUpperCase().endsWith('USDT');
const sanitizeWatchlist = (symbols = []) => {
  const normalized = symbols.map((s) => s.toUpperCase()).filter(isLiveCryptoSymbol);
  return normalized.length > 0 ? [...new Set(normalized)] : LIVE_DEFAULT_WATCHLIST;
};

// Trading Context
const TradingContext = createContext(null);

export const useTradingContext = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingContext must be used within TradingProvider');
  }
  return context;
};

export const TradingProvider = ({ children }) => {
  // Market data
  const [prices, setPrices] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [symbols, setSymbols] = useState([]);
  const [watchlist, setWatchlist] = useState(LIVE_DEFAULT_WATCHLIST);
  
  // Chart data
  const [klines, setKlines] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [timeInterval, setTimeInterval] = useState('1h');
  
  // Trading
  const [signal, setSignal] = useState(null);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  
  // Portfolio
  const [portfolio, setPortfolio] = useState(null);
  const [trades, setTrades] = useState([]);
  
  // Backtest
  const [backtestResult, setBacktestResult] = useState(null);
  
  // Settings
  const [settings, setSettings] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    prices: false,
    klines: false,
    indicators: false,
    signal: false,
    ml: false,
    ai: false,
    backtest: false
  });
  
  // WebSocket simulation via polling
  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);
  const pollingRef = useRef(null);
  const liveRefreshRef = useRef(null);
  const mlRefreshRef = useRef(null);
  
  // Fetch watchlist on mount
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch(`${API}/watchlist`);
        const data = await response.json();
        if (data.watchlist) {
          setWatchlist(sanitizeWatchlist(data.watchlist));
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        setWatchlist(LIVE_DEFAULT_WATCHLIST);
      }
    };
    fetchWatchlist();
  }, []);
  
  // Fetch prices via polling (WebSocket not available through Kubernetes ingress)
  const startPricePolling = useCallback(() => {
    const fetchPrices = async () => {
      // Use watchlist for price polling
      const symbolsToFetch = sanitizeWatchlist(watchlist);
      const requests = symbolsToFetch.map((symbol) => fetch(`${API}/assets/ticker/${symbol}`));

      try {
        const responses = await Promise.allSettled(requests);
        let successCount = 0;

        for (const res of responses) {
          if (res.status !== 'fulfilled' || !res.value.ok) {
            continue;
          }
          const data = await res.value.json();
          if (data.success) {
            successCount += 1;
            setPrices(prev => ({
              ...prev,
              [data.symbol]: data
            }));
          }
        }

        setWsConnected(successCount > 0);
      } catch (error) {
        console.error('Price polling error:', error);
        setWsConnected(false);
      }
    };
    
    // Fetch immediately
    fetchPrices();
    
    // Then poll every 3 seconds
    pollingRef.current = setInterval(fetchPrices, 3000);
  }, [watchlist]);
  
  const stopPricePolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const stopLiveRefresh = useCallback(() => {
    if (liveRefreshRef.current) {
      clearInterval(liveRefreshRef.current);
      liveRefreshRef.current = null;
    }
    if (mlRefreshRef.current) {
      clearInterval(mlRefreshRef.current);
      mlRefreshRef.current = null;
    }
  }, []);
  
  // API calls
  const fetchSymbols = useCallback(async () => {
    try {
      const response = await fetch(`${API}/market/symbols`);
      const data = await response.json();
      if (data.success) {
        setSymbols(data.symbols);
      }
    } catch (error) {
      console.error('Error fetching symbols:', error);
    }
  }, []);
  
  const fetchKlines = useCallback(async (
    symbol = selectedSymbol,
    int = timeInterval,
    limit = 100,
    options = {}
  ) => {
    const { incremental = false, silent = false, maxPoints = 100 } = options;

    if (!silent) {
      setLoading(prev => ({ ...prev, klines: true }));
    }

    try {
      const response = await fetch(`${API}/market/klines/${symbol}?interval=${int}&limit=${limit}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        if (!incremental) {
          setKlines(data.data);
          return;
        }

        // Merge only the latest candles to avoid full chart redraw/flicker.
        setKlines((prev) => {
          if (!Array.isArray(prev) || prev.length === 0) {
            return data.data.slice(-maxPoints);
          }

          const mapByTimestamp = new Map(prev.map((k) => [k.timestamp, k]));
          for (const candle of data.data) {
            mapByTimestamp.set(candle.timestamp, candle);
          }

          const merged = Array.from(mapByTimestamp.values())
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-maxPoints);

          return merged;
        });
      }
    } catch (error) {
      console.error('Error fetching klines:', error);
    } finally {
      if (!silent) {
        setLoading(prev => ({ ...prev, klines: false }));
      }
    }
  }, [selectedSymbol, timeInterval]);
  
  const fetchIndicators = useCallback(async (
    symbol = selectedSymbol,
    int = timeInterval,
    options = {}
  ) => {
    const { silent = false } = options;

    if (!silent) {
      setLoading(prev => ({ ...prev, indicators: true }));
    }

    try {
      const response = await fetch(`${API}/indicators/calculate?symbol=${symbol}&interval=${int}&limit=100`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      // Extract indicators from the response
      if (data.indicators) {
        setIndicators(data.indicators);
      } else {
        setIndicators(data);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
    } finally {
      if (!silent) {
        setLoading(prev => ({ ...prev, indicators: false }));
      }
    }
  }, [selectedSymbol, timeInterval]);
  
  const fetchSignal = useCallback(async (symbol = selectedSymbol, strategy = 'composite', options = {}) => {
    const { silent = false } = options;
    if (!silent) setLoading(prev => ({ ...prev, signal: true }));
    try {
      const response = await fetch(`${API}/strategies/signal?symbol=${symbol}&interval=${timeInterval}&strategy_name=${strategy}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setSignal(data);
    } catch (error) {
      console.error('Error fetching signal:', error);
    } finally {
      if (!silent) setLoading(prev => ({ ...prev, signal: false }));
    }
  }, [selectedSymbol, timeInterval]);
  
  const trainMLModel = useCallback(async (symbol = selectedSymbol) => {
    setLoading(prev => ({ ...prev, ml: true }));
    try {
      const response = await fetch(`${API}/ml/train?symbol=${symbol}&interval=${timeInterval}&limit=500&horizon=5`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error training ML:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, ml: false }));
    }
  }, [selectedSymbol, timeInterval]);
  
  const fetchMLPrediction = useCallback(async (symbol = selectedSymbol) => {
    setLoading(prev => ({ ...prev, ml: true }));
    try {
      const response = await fetch(`${API}/ml/predict?symbol=${symbol}&interval=${timeInterval}&limit=100`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setMlPrediction(data);
      return data;
    } catch (error) {
      console.error('Error fetching ML prediction:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, ml: false }));
    }
  }, [selectedSymbol, timeInterval]);
  
  const fetchAIAnalysis = useCallback(async (symbol = selectedSymbol, language = 'English') => {
    setLoading(prev => ({ ...prev, ai: true }));
    try {
      const response = await fetch(`${API}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol,
          include_ml: true,
          include_llm: true,
          language: language
        })
      });
      const data = await response.json();
      setAiAnalysis(data);
      return data;
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, ai: false }));
    }
  }, [selectedSymbol]);
  
  const runBacktest = useCallback(async (config) => {
    setLoading(prev => ({ ...prev, backtest: true }));
    try {
      const response = await fetch(`${API}/backtest/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      setBacktestResult(data);
      return data;
    } catch (error) {
      console.error('Error running backtest:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, backtest: false }));
    }
  }, []);
  
  const fetchPortfolio = useCallback(async (portfolioId) => {
    try {
      const response = await fetch(`${API}/portfolio/${portfolioId}`);
      const data = await response.json();
      setPortfolio(data);
      return data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return null;
    }
  }, []);
  
  const createPortfolio = useCallback(async (name, initialCapital) => {
    try {
      const response = await fetch(`${API}/portfolio/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          initial_capital: initialCapital,
          currency: 'USDT'
        })
      });
      const data = await response.json();
      setPortfolio(data);
      return data;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      return null;
    }
  }, []);
  
  const executeTrade = useCallback(async (portfolioId, trade) => {
    try {
      const response = await fetch(`${API}/portfolio/${portfolioId}/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade)
      });
      const data = await response.json();
      if (data.trade) {
        setTrades(prev => [data.trade, ...prev]);
        // Refresh portfolio
        await fetchPortfolio(portfolioId);
      }
      return data;
    } catch (error) {
      console.error('Error executing trade:', error);
      return null;
    }
  }, [fetchPortfolio]);
  
  const fetchTrades = useCallback(async (portfolioId) => {
    try {
      const response = await fetch(`${API}/portfolio/${portfolioId}/trades?limit=50`);
      const data = await response.json();
      setTrades(data.trades || []);
      return data.trades;
    } catch (error) {
      console.error('Error fetching trades:', error);
      return [];
    }
  }, []);
  
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API}/settings`);
      const data = await response.json();
      setSettings(data);
      return data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }, []);
  
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const response = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await response.json();
      setSettings(data);
      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  }, []);
  
  // Initialize
  useEffect(() => {
    startPricePolling();
    fetchSymbols();
    fetchSettings();
    
    return () => {
      stopPricePolling();
      stopLiveRefresh();
    };
  }, [startPricePolling, stopPricePolling, stopLiveRefresh, fetchSymbols, fetchSettings]);
  
  // Fetch data when symbol or timeInterval changes
  useEffect(() => {
    if (selectedSymbol) {
      fetchKlines();
      fetchIndicators();
      fetchSignal();

      stopLiveRefresh();

      // Refresh chart + indicators + strategy signal continuously.
      liveRefreshRef.current = setInterval(() => {
        fetchKlines(selectedSymbol, timeInterval, 3, {
          incremental: true,
          silent: true,
          maxPoints: 100
        });
        fetchIndicators(selectedSymbol, timeInterval, { silent: true });
        fetchSignal(selectedSymbol, 'composite', { silent: true });
      }, 5000);

      // Refresh ML prediction less frequently to reduce load.
      mlRefreshRef.current = setInterval(() => {
        fetchMLPrediction(selectedSymbol);
      }, 15000);
    }
    return () => {
      stopLiveRefresh();
    };
  }, [selectedSymbol, timeInterval, stopLiveRefresh, fetchKlines, fetchIndicators, fetchSignal, fetchMLPrediction]);
  
  const value = {
    // State
    prices,
    selectedSymbol,
    setSelectedSymbol,
    symbols,
    watchlist,
    setWatchlist,
    klines,
    indicators,
    interval: timeInterval,
    setInterval: setTimeInterval,
    signal,
    mlPrediction,
    aiAnalysis,
    portfolio,
    trades,
    backtestResult,
    settings,
    loading,
    wsConnected,
    
    // Actions
    fetchKlines,
    fetchIndicators,
    fetchSignal,
    trainMLModel,
    fetchMLPrediction,
    fetchAIAnalysis,
    runBacktest,
    fetchPortfolio,
    createPortfolio,
    executeTrade,
    fetchTrades,
    fetchSettings,
    updateSettings
  };
  
  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
};

export default TradingContext;
