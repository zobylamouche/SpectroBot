import React from 'react';
import { useTradingContext } from '../context/TradingContext';
import { useLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PriceDisplay } from '../components/PriceDisplay';
import { PriceChart, RSIChart, MACDChart } from '../components/Charts';
import { SignalCard, MLPredictionCard } from '../components/SignalCards';
import { PortfolioWidget, TradePanel, TradeHistory } from '../components/PortfolioWidget';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { LineChart, RefreshCw } from 'lucide-react';

const Trading = () => {
  const { 
    selectedSymbol, 
    interval, 
    setInterval, 
    fetchKlines, 
    fetchIndicators,
    fetchSignal,
    loading 
  } = useTradingContext();
  const { t } = useLanguage();
  
  const handleRefresh = () => {
    fetchKlines();
    fetchIndicators();
    fetchSignal();
  };
  
  return (
    <div className="max-w-[1800px] mx-auto px-4 py-4" data-testid="trading-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
            {t('trading.title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('trading.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <PriceDisplay symbol={selectedSymbol} />
          
          <Select value={interval || '1h'} onValueChange={setInterval}>
            <SelectTrigger className="w-28 bg-secondary border-border" data-testid="interval-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">{t('intervals.1m')}</SelectItem>
              <SelectItem value="5m">{t('intervals.5m')}</SelectItem>
              <SelectItem value="15m">{t('intervals.15m')}</SelectItem>
              <SelectItem value="1h">{t('intervals.1h')}</SelectItem>
              <SelectItem value="4h">{t('intervals.4h')}</SelectItem>
              <SelectItem value="1d">{t('intervals.1d')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={loading.klines}
            data-testid="refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 ${loading.klines ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left - Charts */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                {selectedSymbol} - {(interval || '1h').toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart height={400} />
            </CardContent>
          </Card>
          
          {/* Indicator Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">RSI (14)</CardTitle>
              </CardHeader>
              <CardContent>
                <RSIChart height={120} />
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">MACD</CardTitle>
              </CardHeader>
              <CardContent>
                <MACDChart height={120} />
              </CardContent>
            </Card>
          </div>
          
          {/* Trade History */}
          <TradeHistory />
        </div>
        
        {/* Right - Trading Panel */}
        <div className="lg:col-span-4 space-y-4">
          <SignalCard />
          <TradePanel />
          <MLPredictionCard />
          <PortfolioWidget />
        </div>
      </div>
    </div>
  );
};

export default Trading;
