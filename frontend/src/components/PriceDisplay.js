import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useTradingContext } from '../context/TradingContext';

export const PriceDisplay = ({ symbol }) => {
  const { prices } = useTradingContext();
  const priceData = prices[symbol];
  
  if (!priceData) {
    return (
      <div className="flex items-center gap-2" data-testid={`price-display-${symbol}`}>
        <span className="font-mono text-xl text-muted-foreground">Loading...</span>
      </div>
    );
  }
  
  const isPositive = priceData.price_change_pct >= 0;
  
  return (
    <div className="flex items-center gap-4" data-testid={`price-display-${symbol}`}>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-white">
          ${priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          {symbol.replace('USDT', '')}
        </span>
      </div>
      
      <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
        isPositive ? 'bg-neon-green/10' : 'bg-neon-red/10'
      }`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-neon-green" />
        ) : (
          <TrendingDown className="w-4 h-4 text-neon-red" />
        )}
        <span className={`font-mono text-sm font-medium ${
          isPositive ? 'text-neon-green' : 'text-neon-red'
        }`}>
          {isPositive ? '+' : ''}{priceData.price_change_pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export const PriceCard = ({ symbol, onClick, isSelected }) => {
  const { prices } = useTradingContext();
  const priceData = prices[symbol];
  
  if (!priceData) {
    return (
      <div 
        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-neon-green/50 bg-neon-green/5' 
            : 'border-border bg-card hover:border-white/20'
        }`}
        onClick={() => onClick && onClick(symbol)}
        data-testid={`price-card-${symbol}`}
      >
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-white">{symbol.replace('USDT', '')}</span>
          <Activity className="w-4 h-4 text-muted-foreground animate-pulse" />
        </div>
        <div className="mt-2">
          <div className="h-6 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }
  
  const isPositive = priceData.price_change_pct >= 0;
  
  return (
    <div 
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-neon-green/50 bg-neon-green/5' 
          : 'border-border bg-card hover:border-white/20 hover:-translate-y-0.5'
      }`}
      onClick={() => onClick && onClick(symbol)}
      data-testid={`price-card-${symbol}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-white">{symbol.replace('USDT', '')}</span>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-neon-green" />
        ) : (
          <TrendingDown className="w-4 h-4 text-neon-red" />
        )}
      </div>
      
      <div className="mt-2">
        <span className="font-mono text-xl font-bold text-white">
          ${priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      
      <div className="mt-1 flex items-center justify-between">
        <span className={`font-mono text-sm ${isPositive ? 'text-neon-green' : 'text-neon-red'}`}>
          {isPositive ? '+' : ''}{priceData.price_change_pct.toFixed(2)}%
        </span>
        <span className="text-xs text-muted-foreground">24h</span>
      </div>
    </div>
  );
};

export const MiniPriceRow = ({ symbol }) => {
  const { prices, setSelectedSymbol, selectedSymbol } = useTradingContext();
  const priceData = prices[symbol];
  const isSelected = selectedSymbol === symbol;
  
  if (!priceData) return null;
  
  const isPositive = priceData.price_change_pct >= 0;
  
  // Format display name - remove common suffixes
  const displayName = symbol.replace('USDT', '').replace('USD', '');
  
  // Format price based on value
  const formatPrice = (price) => {
    if (price >= 1000) {
      return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return price.toFixed(2);
    } else {
      return price.toFixed(4);
    }
  };
  
  return (
    <div 
      className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all rounded-lg ${
        isSelected 
          ? 'bg-neon-green/10 border-l-2 border-neon-green' 
          : 'hover:bg-white/5'
      }`}
      onClick={() => setSelectedSymbol(symbol)}
      data-testid={`mini-price-${symbol}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-white text-sm">
          {displayName}
        </span>
        {priceData.type && priceData.type !== 'crypto' && (
          <span className="text-[10px] text-muted-foreground uppercase">{priceData.type}</span>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-white">
          ${formatPrice(priceData.price)}
        </span>
        <span className={`font-mono text-xs w-16 text-right ${
          isPositive ? 'text-neon-green' : 'text-neon-red'
        }`}>
          {isPositive ? '+' : ''}{priceData.price_change_pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default PriceDisplay;
