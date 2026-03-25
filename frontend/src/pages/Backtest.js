import React from 'react';
import { useTradingContext } from '../context/TradingContext';
import { useLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BacktestPanel } from '../components/BacktestPanel';
import { EquityCurveChart } from '../components/Charts';
import { FlaskConical, TrendingUp, BarChart3 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';

const Backtest = () => {
  const { backtestResult, selectedSymbol } = useTradingContext();
  const { t } = useLanguage();
  
  return (
    <div className="max-w-[1800px] mx-auto px-4 py-4" data-testid="backtest-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
            {t('backtest.title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('backtest.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground">
            Testing: {selectedSymbol}
          </Badge>
        </div>
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left - Configuration */}
        <div className="lg:col-span-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                {t('backtest.configuration')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BacktestPanel />
            </CardContent>
          </Card>
        </div>
        
        {/* Right - Results */}
        <div className="lg:col-span-8 space-y-4">
          {backtestResult?.success ? (
            <>
              {/* Equity Curve */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t('backtest.equityCurve')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EquityCurveChart data={backtestResult.equity_curve} height={250} />
                </CardContent>
              </Card>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label={t('backtest.netProfit')}
                  value={`$${backtestResult.metrics.net_profit.toLocaleString()}`}
                  subValue={`${backtestResult.metrics.net_profit_pct >= 0 ? '+' : ''}${backtestResult.metrics.net_profit_pct}%`}
                  positive={backtestResult.metrics.net_profit >= 0}
                />
                <MetricCard
                  label={t('backtest.winRate')}
                  value={`${backtestResult.metrics.win_rate}%`}
                  subValue={`${backtestResult.metrics.winning_trades}W / ${backtestResult.metrics.losing_trades}L`}
                  positive={backtestResult.metrics.win_rate >= 50}
                />
                <MetricCard
                  label={t('backtest.sharpeRatio')}
                  value={backtestResult.metrics.sharpe_ratio.toFixed(2)}
                  positive={backtestResult.metrics.sharpe_ratio > 1}
                />
                <MetricCard
                  label={t('backtest.maxDrawdown')}
                  value={`${backtestResult.metrics.max_drawdown_pct}%`}
                  positive={false}
                  neutral
                />
              </div>
              
              {/* Trade List */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {t('backtest.tradeLog')} ({backtestResult.trades.length} trades)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {backtestResult.trades.map((trade, index) => (
                        <TradeRow key={index} trade={trade} />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-16">
                <div className="text-center">
                  <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">{t('backtest.noResults')}</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    {backtestResult?.error || t('backtest.configureAndRun')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, subValue, positive, neutral }) => {
  const { t } = useLanguage();
  
  return (
    <Card className="bg-secondary/30 border-border">
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`font-mono text-xl font-bold ${
          neutral ? 'text-white' : positive ? 'text-neon-green' : 'text-neon-red'
        }`}>
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
};

const TradeRow = ({ trade }) => {
  const { t } = useLanguage();
  const isBuy = trade.type === 'BUY';
  const hasPnL = trade.pnl !== undefined;
  const isProfit = trade.pnl >= 0;
  
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
      <div className="flex items-center gap-3">
        <Badge className={`${
          isBuy 
            ? 'bg-neon-green/20 text-neon-green border-neon-green/30' 
            : 'bg-neon-red/20 text-neon-red border-neon-red/30'
        }`}>
          {isBuy ? t('signals.buy') : t('signals.sell')}
        </Badge>
        <div>
          <div className="flex items-center gap-2">
            {isBuy ? (
              <span className="font-mono text-sm text-white">
                @ ${trade.price?.toFixed(2)}
              </span>
            ) : (
              <span className="font-mono text-sm text-white">
                @ ${trade.exit_price?.toFixed(2)}
              </span>
            )}
            {trade.reason && (
              <Badge variant="outline" className="text-xs">
                {trade.reason}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Qty: {trade.quantity?.toFixed(6)}
          </p>
        </div>
      </div>
      
      {hasPnL && (
        <div className="text-right">
          <p className={`font-mono text-sm font-bold ${
            isProfit ? 'text-neon-green' : 'text-neon-red'
          }`}>
            {isProfit ? '+' : ''}{trade.pnl_pct?.toFixed(2)}%
          </p>
          <p className={`font-mono text-xs ${
            isProfit ? 'text-neon-green' : 'text-neon-red'
          }`}>
            ${trade.pnl?.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Backtest;
