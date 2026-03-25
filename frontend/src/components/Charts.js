import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { useTradingContext } from '../context/TradingContext';

// Format timestamp to readable date
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format price for tooltip
const formatPrice = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass p-3 rounded-lg border border-white/10">
        <p className="text-xs text-muted-foreground mb-2">{formatDate(data.timestamp)}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-xs text-muted-foreground">Open</span>
            <span className="font-mono text-xs text-white">{formatPrice(data.open)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-muted-foreground">High</span>
            <span className="font-mono text-xs text-neon-green">{formatPrice(data.high)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-muted-foreground">Low</span>
            <span className="font-mono text-xs text-neon-red">{formatPrice(data.low)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-muted-foreground">Close</span>
            <span className="font-mono text-xs text-white">{formatPrice(data.close)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const PriceChart = ({ height = 300 }) => {
  const { klines, indicators, loading } = useTradingContext();
  
  const chartData = useMemo(() => {
    if (!klines || klines.length === 0) return [];
    
    return klines.map((k, i) => ({
      timestamp: k.timestamp,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
      volume: k.volume,
      ema_short: indicators?.ema_short?.[i] || null,
      ema_long: indicators?.ema_long?.[i] || null
    }));
  }, [klines, indicators]);
  
  if (loading.klines) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height, minHeight: height }} data-testid="price-chart-loading">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height, minHeight: height }} data-testid="price-chart-empty">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }
  
  const minPrice = Math.min(...chartData.map(d => d.low)) * 0.999;
  const maxPrice = Math.max(...chartData.map(d => d.high)) * 1.001;
  
  return (
    <div className="w-full" style={{ height, minHeight: height }} data-testid="price-chart">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF94" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatDate}
            stroke="#52525B"
            tick={{ fill: '#A1A1AA', fontSize: 11 }}
            axisLine={{ stroke: '#27272A' }}
          />
          <YAxis 
            domain={[minPrice, maxPrice]}
            tickFormatter={(v) => `$${v.toLocaleString()}`}
            stroke="#52525B"
            tick={{ fill: '#A1A1AA', fontSize: 11 }}
            axisLine={{ stroke: '#27272A' }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#00FF94"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
          {indicators?.ema_short && (
            <Line
              type="monotone"
              dataKey="ema_short"
              stroke="#007AFF"
              strokeWidth={1}
              dot={false}
              strokeDasharray="5 5"
            />
          )}
          {indicators?.ema_long && (
            <Line
              type="monotone"
              dataKey="ema_long"
              stroke="#FFCC00"
              strokeWidth={1}
              dot={false}
              strokeDasharray="5 5"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RSIChart = ({ height = 120 }) => {
  const { indicators, klines, loading } = useTradingContext();
  
  const chartData = useMemo(() => {
    if (!indicators?.rsi || !klines) return [];
    
    return klines.map((k, i) => ({
      timestamp: k.timestamp,
      rsi: indicators.rsi[i]
    })).filter(d => d.rsi !== null && d.rsi !== undefined);
  }, [indicators, klines]);
  
  if (loading.indicators || chartData.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-muted-foreground text-sm" style={{ height, minHeight: height }}>
        Loading RSI...
      </div>
    );
  }
  
  return (
    <div className="w-full" style={{ height, minHeight: height }} data-testid="rsi-chart">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatDate}
            stroke="#52525B"
            tick={{ fill: '#A1A1AA', fontSize: 10 }}
            axisLine={{ stroke: '#27272A' }}
          />
          <YAxis 
            domain={[0, 100]}
            ticks={[30, 50, 70]}
            stroke="#52525B"
            tick={{ fill: '#A1A1AA', fontSize: 10 }}
            axisLine={{ stroke: '#27272A' }}
            width={40}
          />
          <ReferenceLine y={70} stroke="#FF3B30" strokeDasharray="3 3" />
          <ReferenceLine y={30} stroke="#00FF94" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="rsi"
            stroke="#007AFF"
            strokeWidth={1.5}
            fill="url(#rsiGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MACDChart = ({ height = 120 }) => {
  const { indicators, klines, loading } = useTradingContext();
  
  const chartData = useMemo(() => {
    if (!indicators?.macd || !klines) return [];
    
    return klines.map((k, i) => ({
      timestamp: k.timestamp,
      macd: indicators.macd.macd_line?.[i] || null,
      signal: indicators.macd.signal_line?.[i] || null,
      histogram: indicators.macd.histogram?.[i] || null
    })).filter(d => d.histogram !== null && d.histogram !== undefined);
  }, [indicators, klines]);
  
  if (loading.indicators || chartData.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-muted-foreground text-sm" style={{ height, minHeight: height }}>
        Loading MACD...
      </div>
    );
  }
  
  return (
    <div className="w-full" style={{ height, minHeight: height }} data-testid="macd-chart">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatDate}
            stroke="#52525B"
            tick={{ fill: '#A1A1AA', fontSize: 10 }}
            axisLine={{ stroke: '#27272A' }}
          />
          <YAxis 
            stroke="#52525B"
            tick={{ fill: '#A1A1AA', fontSize: 10 }}
            axisLine={{ stroke: '#27272A' }}
            width={50}
          />
          <ReferenceLine y={0} stroke="#3F3F46" />
          <Bar
            dataKey="histogram"
            fill={(entry) => entry.histogram >= 0 ? '#00FF94' : '#FF3B30'}
          >
            {chartData.map((entry, index) => (
              <Bar 
                key={index}
                fill={entry.histogram >= 0 ? '#00FF94' : '#FF3B30'}
              />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="macd"
            stroke="#007AFF"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="signal"
            stroke="#FFCC00"
            strokeWidth={1.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const EquityCurveChart = ({ data, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-muted-foreground text-sm" style={{ height, minHeight: height }}>
        No equity data
      </div>
    );
  }
  
  const chartData = data.map((equity, i) => ({
    index: i,
    equity
  }));
  
  const minEquity = Math.min(...data);
  const maxEquity = Math.max(...data);
  const isProfit = data[data.length - 1] > data[0];
  
  return (
    <div className="w-full" style={{ height, minHeight: height }} data-testid="equity-chart">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isProfit ? '#00FF94' : '#FF3B30'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isProfit ? '#00FF94' : '#FF3B30'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
          <XAxis 
            dataKey="index"
            stroke="#52525B"
            tick={{ fill: '#A1A1AA', fontSize: 10 }}
            axisLine={{ stroke: '#27272A' }}
          />
          <YAxis 
            domain={[minEquity * 0.99, maxEquity * 1.01]}
            tickFormatter={(v) => `$${v.toLocaleString()}`}
            stroke="#52525B"
            tick={{ fill: '#A1A1AA', fontSize: 10 }}
            axisLine={{ stroke: '#27272A' }}
            width={70}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="glass p-2 rounded-lg border border-white/10">
                    <p className="font-mono text-sm text-white">
                      ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={isProfit ? '#00FF94' : '#FF3B30'}
            strokeWidth={2}
            fill="url(#equityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
