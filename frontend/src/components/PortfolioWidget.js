import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, Plus } from 'lucide-react';
import { useTradingContext } from '../context/TradingContext';
import { useLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

export const PortfolioWidget = () => {
  const { portfolio, createPortfolio, prices, selectedSymbol } = useTradingContext();
  const { t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('My Portfolio');
  const [initialCapital, setInitialCapital] = useState(10000);
  
  const handleCreate = async () => {
    setIsCreating(true);
    await createPortfolio(newPortfolioName, initialCapital);
    setIsCreating(false);
  };
  
  if (!portfolio) {
    return (
      <Card className="bg-card border-border" data-testid="portfolio-widget">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            {t('portfolio.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('portfolio.createToStart')}
            </p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('portfolio.portfolioName')}</Label>
                <Input
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  className="bg-secondary border-border"
                  data-testid="portfolio-name-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('portfolio.initialCapital')}</Label>
                <Input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
                  className="bg-secondary border-border"
                  data-testid="initial-capital-input"
                />
              </div>
              
              <Button 
                className="w-full bg-neon-green hover:bg-neon-green/90 text-black"
                onClick={handleCreate}
                disabled={isCreating}
                data-testid="create-portfolio-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? t('portfolio.creating') : t('portfolio.createPortfolio')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const isProfit = portfolio.total_pnl >= 0;
  
  // Calculate total value including positions
  let totalValue = portfolio.current_capital;
  Object.entries(portfolio.positions || {}).forEach(([symbol, pos]) => {
    const currentPrice = prices[symbol]?.price || pos.avg_price;
    totalValue += pos.quantity * currentPrice;
  });
  
  return (
    <Card className="bg-card border-border" data-testid="portfolio-widget">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          {portfolio.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Value */}
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground mb-1">{t('portfolio.totalValue')}</p>
            <p className="font-mono text-3xl font-bold text-white">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center justify-center gap-1 mt-1 ${
              isProfit ? 'text-neon-green' : 'text-neon-red'
            }`}>
              {isProfit ? (
                <ArrowUpCircle className="w-4 h-4" />
              ) : (
                <ArrowDownCircle className="w-4 h-4" />
              )}
              <span className="font-mono text-sm">
                {isProfit ? '+' : ''}{portfolio.total_pnl_pct.toFixed(2)}%
              </span>
              <span className="font-mono text-sm">
                (${portfolio.total_pnl.toFixed(2)})
              </span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">{t('portfolio.available')}</p>
              <p className="font-mono text-sm font-bold text-white">
                ${portfolio.current_capital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">{t('portfolio.initial')}</p>
              <p className="font-mono text-sm font-bold text-white">
                ${portfolio.initial_capital.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Positions */}
          {Object.keys(portfolio.positions || {}).length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">{t('portfolio.openPositions')}</p>
              <div className="space-y-2">
                {Object.entries(portfolio.positions).map(([symbol, pos]) => {
                  const currentPrice = prices[symbol]?.price || pos.avg_price;
                  const pnl = (currentPrice - pos.avg_price) * pos.quantity;
                  const pnlPct = ((currentPrice - pos.avg_price) / pos.avg_price) * 100;
                  const posProfit = pnl >= 0;
                  
                  return (
                    <div key={symbol} className="flex items-center justify-between bg-secondary/30 rounded-lg p-2">
                      <div>
                        <span className="font-medium text-white text-sm">{symbol.replace('USDT', '')}</span>
                        <p className="text-xs text-muted-foreground">
                          {pos.quantity.toFixed(6)} @ ${pos.avg_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-sm ${posProfit ? 'text-neon-green' : 'text-neon-red'}`}>
                          {posProfit ? '+' : ''}{pnlPct.toFixed(2)}%
                        </p>
                        <p className={`font-mono text-xs ${posProfit ? 'text-neon-green' : 'text-neon-red'}`}>
                          ${pnl.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const TradePanel = () => {
  const { portfolio, executeTrade, prices, selectedSymbol, signal } = useTradingContext();
  const { t } = useLanguage();
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const currentPrice = prices[selectedSymbol]?.price || 0;
  const tradeValue = parseFloat(quantity || 0) * currentPrice;
  
  const handleTrade = async () => {
    if (!portfolio || !quantity || parseFloat(quantity) <= 0) return;
    
    setIsExecuting(true);
    await executeTrade(portfolio.id, {
      portfolio_id: portfolio.id,
      symbol: selectedSymbol,
      side: side,
      quantity: parseFloat(quantity),
      price: currentPrice,
      strategy: signal?.strategy || null
    });
    setQuantity('');
    setIsExecuting(false);
  };
  
  if (!portfolio) {
    return (
      <Card className="bg-card border-border" data-testid="trade-panel">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground text-sm">
            {t('trading.createPortfolioFirst')}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-card border-border" data-testid="trade-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Trade {selectedSymbol.replace('USDT', '')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={side === 'BUY' ? 'default' : 'outline'}
              className={side === 'BUY' 
                ? 'bg-neon-green hover:bg-neon-green/90 text-black' 
                : 'border-border hover:bg-neon-green/10'
              }
              onClick={() => setSide('BUY')}
              data-testid="buy-toggle-btn"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              {t('trading.buy')}
            </Button>
            <Button
              variant={side === 'SELL' ? 'default' : 'outline'}
              className={side === 'SELL' 
                ? 'bg-neon-red hover:bg-neon-red/90 text-white' 
                : 'border-border hover:bg-neon-red/10'
              }
              onClick={() => setSide('SELL')}
              data-testid="sell-toggle-btn"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              {t('trading.sell')}
            </Button>
          </div>
          
          {/* Current Price */}
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">{t('trading.currentPrice')}</p>
            <p className="font-mono text-xl font-bold text-white">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          {/* Quantity Input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t('trading.quantity')} ({selectedSymbol.replace('USDT', '')})</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              className="bg-secondary border-border font-mono"
              data-testid="quantity-input"
            />
          </div>
          
          {/* Trade Value */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('trading.tradeValue')}</span>
            <span className="font-mono text-white">
              ${tradeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          {/* Execute Button */}
          <Button
            className={`w-full font-medium ${
              side === 'BUY' 
                ? 'bg-neon-green hover:bg-neon-green/90 text-black' 
                : 'bg-neon-red hover:bg-neon-red/90 text-white'
            }`}
            onClick={handleTrade}
            disabled={isExecuting || !quantity || parseFloat(quantity) <= 0}
            data-testid="execute-trade-btn"
          >
            {isExecuting ? t('trading.executing') : `${side === 'BUY' ? t('trading.buy') : t('trading.sell')} ${selectedSymbol.replace('USDT', '')}`}
          </Button>
          
          {/* Available Balance */}
          <div className="text-center text-xs text-muted-foreground">
            {t('trading.available')}: ${portfolio.current_capital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TradeHistory = () => {
  const { trades, portfolio, fetchTrades } = useTradingContext();
  const { t } = useLanguage();
  
  useEffect(() => {
    if (portfolio?.id) {
      fetchTrades(portfolio.id);
    }
  }, [portfolio?.id, fetchTrades]);
  
  return (
    <Card className="bg-card border-border" data-testid="trade-history">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <History className="w-4 h-4" />
          {t('trading.tradeHistory')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {trades.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
              {t('trading.noTrades')}
            </div>
          ) : (
            <div className="space-y-2">
              {trades.map((trade, index) => (
                <div 
                  key={trade.id || index}
                  className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      trade.side === 'BUY' 
                        ? 'bg-neon-green/20 text-neon-green border-neon-green/30' 
                        : 'bg-neon-red/20 text-neon-red border-neon-red/30'
                    }`}>
                      {trade.side === 'BUY' ? t('signals.buy') : t('signals.sell')}
                    </Badge>
                    <div>
                      <span className="text-sm text-white">{trade.symbol?.replace('USDT', '')}</span>
                      <p className="text-xs text-muted-foreground">
                        {trade.quantity?.toFixed(6)} @ ${trade.price?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-white">
                      ${trade.value?.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PortfolioWidget;
