import React from 'react';
import { useTradingContext } from '../context/TradingContext';
import { useLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PriceDisplay, MiniPriceRow } from '../components/PriceDisplay';
import { PriceChart, RSIChart, MACDChart } from '../components/Charts';
import { SignalCard, MLPredictionCard, AIAnalysisCard } from '../components/SignalCards';
import { PortfolioWidget } from '../components/PortfolioWidget';
import { Activity, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { selectedSymbol, indicators, klines, watchlist } = useTradingContext();
  const { t } = useLanguage();
  
  // Get latest indicator values
  const latestRSI = indicators?.rsi?.[indicators.rsi.length - 1];
  const latestMACD = indicators?.macd?.histogram?.[indicators.macd.histogram.length - 1];
  const supertrendDir = indicators?.supertrend?.direction?.[indicators.supertrend.direction.length - 1];
  
  // Use watchlist or default
  const displayWatchlist = watchlist?.length > 0 ? watchlist : ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];
  
  return (
    <div className="max-w-[1800px] mx-auto px-4 py-4" data-testid="dashboard-page">
      {/* Header with Price */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <PriceDisplay symbol={selectedSymbol} />
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Watchlist */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {t('dashboard.watchlist')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {displayWatchlist.map((symbol) => (
                  <MiniPriceRow key={symbol} symbol={symbol} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Center Column - Charts */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Price Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {selectedSymbol} {t('dashboard.priceChart')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart height={320} />
            </CardContent>
          </Card>
          
          {/* Indicator Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">RSI (14)</CardTitle>
                  {latestRSI && (
                    <span className={`font-mono text-sm font-bold ${
                      latestRSI > 70 ? 'text-neon-red' : latestRSI < 30 ? 'text-neon-green' : 'text-white'
                    }`}>
                      {latestRSI.toFixed(1)}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <RSIChart height={100} />
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MACD</CardTitle>
                  {latestMACD !== null && latestMACD !== undefined && (
                    <span className={`font-mono text-sm font-bold ${
                      latestMACD > 0 ? 'text-neon-green' : 'text-neon-red'
                    }`}>
                      {latestMACD.toFixed(2)}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <MACDChart height={100} />
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickStat 
              label="RSI"
              value={latestRSI?.toFixed(1) || '--'}
              status={latestRSI > 70 ? 'overbought' : latestRSI < 30 ? 'oversold' : 'neutral'}
            />
            <QuickStat 
              label={t('signals.bullish').split(' ')[0]}
              value={supertrendDir === 1 ? t('signals.bullish') : supertrendDir === -1 ? t('signals.bearish') : '--'}
              status={supertrendDir === 1 ? 'bullish' : supertrendDir === -1 ? 'bearish' : 'neutral'}
            />
            <QuickStat 
              label="MACD"
              value={latestMACD > 0 ? '+' : latestMACD < 0 ? '-' : '--'}
              status={latestMACD > 0 ? 'bullish' : latestMACD < 0 ? 'bearish' : 'neutral'}
            />
            <QuickStat 
              label={t('common.dataPoints')}
              value={klines.length}
              status="neutral"
            />
          </div>
        </div>
        
        {/* Right Column - Signals & Portfolio */}
        <div className="lg:col-span-3 space-y-4">
          <SignalCard />
          <MLPredictionCard />
          <PortfolioWidget />
        </div>
      </div>
      
      {/* Bottom Section - AI Analysis */}
      <div className="mt-4">
        <AIAnalysisCard />
      </div>
    </div>
  );
};

const QuickStat = ({ label, value, status }) => {
  const statusColors = {
    bullish: 'bg-neon-green/10 border-neon-green/30 text-neon-green',
    bearish: 'bg-neon-red/10 border-neon-red/30 text-neon-red',
    overbought: 'bg-neon-red/10 border-neon-red/30 text-neon-red',
    oversold: 'bg-neon-green/10 border-neon-green/30 text-neon-green',
    neutral: 'bg-secondary/50 border-border text-white'
  };
  
  return (
    <div className={`rounded-lg border p-3 ${statusColors[status]}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-mono text-lg font-bold">{value}</p>
    </div>
  );
};

export default Dashboard;
