import React, { useState } from 'react';
import { Play, Settings2, TrendingUp, BarChart3 } from 'lucide-react';
import { useTradingContext } from '../context/TradingContext';
import { useLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EquityCurveChart } from './Charts';

export const BacktestPanel = () => {
  const { selectedSymbol, runBacktest, backtestResult, loading } = useTradingContext();
  const { t } = useLanguage();
  
  const [config, setConfig] = useState({
    symbol: selectedSymbol,
    interval: '1h',
    limit: 500,
    strategy_name: 'composite',
    initial_capital: 10000,
    position_size_pct: 10,
    trading_fee_pct: 0.1,
    stop_loss_pct: '',
    take_profit_pct: ''
  });
  
  const handleRunBacktest = async () => {
    const backtestConfig = {
      ...config,
      stop_loss_pct: config.stop_loss_pct ? parseFloat(config.stop_loss_pct) : null,
      take_profit_pct: config.take_profit_pct ? parseFloat(config.take_profit_pct) : null
    };
    await runBacktest(backtestConfig);
  };
  
  return (
    <div className="space-y-4" data-testid="backtest-panel">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
          <TabsTrigger value="config" className="data-[state=active]:bg-white/10">
            <Settings2 className="w-4 h-4 mr-2" />
            {t('backtest.configuration')}
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-white/10">
            <BarChart3 className="w-4 h-4 mr-2" />
            {t('backtest.results')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('backtest.strategy')}</Label>
              <Select
                value={config.strategy_name}
                onValueChange={(v) => setConfig({ ...config, strategy_name: v })}
              >
                <SelectTrigger data-testid="strategy-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="composite">{t('strategies.composite')}</SelectItem>
                  <SelectItem value="ema_crossover">{t('strategies.ema_crossover')}</SelectItem>
                  <SelectItem value="ema_rsi">{t('strategies.ema_rsi')}</SelectItem>
                  <SelectItem value="macd">{t('strategies.macd')}</SelectItem>
                  <SelectItem value="supertrend">{t('strategies.supertrend')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('backtest.interval')}</Label>
              <Select
                value={config.interval}
                onValueChange={(v) => setConfig({ ...config, interval: v })}
              >
                <SelectTrigger data-testid="interval-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">{t('intervals.15m')}</SelectItem>
                  <SelectItem value="1h">{t('intervals.1h')}</SelectItem>
                  <SelectItem value="4h">{t('intervals.4h')}</SelectItem>
                  <SelectItem value="1d">{t('intervals.1d')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('backtest.initialCapital')}</Label>
              <Input
                type="number"
                value={config.initial_capital}
                onChange={(e) => setConfig({ ...config, initial_capital: parseFloat(e.target.value) })}
                className="bg-secondary border-border"
                data-testid="initial-capital-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('backtest.positionSize')}</Label>
              <Input
                type="number"
                value={config.position_size_pct}
                onChange={(e) => setConfig({ ...config, position_size_pct: parseFloat(e.target.value) })}
                className="bg-secondary border-border"
                data-testid="position-size-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('backtest.stopLoss')}</Label>
              <Input
                type="number"
                value={config.stop_loss_pct}
                onChange={(e) => setConfig({ ...config, stop_loss_pct: e.target.value })}
                placeholder={t('backtest.optional')}
                className="bg-secondary border-border"
                data-testid="stop-loss-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('backtest.takeProfit')}</Label>
              <Input
                type="number"
                value={config.take_profit_pct}
                onChange={(e) => setConfig({ ...config, take_profit_pct: e.target.value })}
                placeholder={t('backtest.optional')}
                className="bg-secondary border-border"
                data-testid="take-profit-input"
              />
            </div>
          </div>
          
          <Button 
            className="w-full bg-neon-green hover:bg-neon-green/90 text-black font-medium"
            onClick={handleRunBacktest}
            disabled={loading.backtest}
            data-testid="run-backtest-btn"
          >
            {loading.backtest ? (
              <>{t('backtest.runningSimulation')}</>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {t('backtest.runBacktest')}
              </>
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          {backtestResult?.success ? (
            <BacktestResults result={backtestResult} />
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              {backtestResult?.error || t('backtest.configureAndRun')}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BacktestResults = ({ result }) => {
  const { t } = useLanguage();
  const metrics = result.metrics;
  const isProfit = metrics.net_profit >= 0;
  
  return (
    <div className="space-y-4" data-testid="backtest-results">
      {/* Equity Curve */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('backtest.equityCurve')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EquityCurveChart data={result.equity_curve} height={150} />
        </CardContent>
      </Card>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricBox
          label={t('backtest.netProfit')}
          value={`$${metrics.net_profit.toLocaleString()}`}
          subValue={`${metrics.net_profit_pct >= 0 ? '+' : ''}${metrics.net_profit_pct}%`}
          positive={isProfit}
        />
        <MetricBox
          label={t('backtest.winRate')}
          value={`${metrics.win_rate}%`}
          subValue={`${metrics.winning_trades}/${metrics.total_trades}`}
          positive={metrics.win_rate >= 50}
        />
        <MetricBox
          label={t('backtest.maxDrawdown')}
          value={`${metrics.max_drawdown_pct}%`}
          positive={false}
          neutral={true}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <MetricBox
          label={t('backtest.sharpeRatio')}
          value={metrics.sharpe_ratio.toFixed(2)}
          positive={metrics.sharpe_ratio > 1}
        />
        <MetricBox
          label={t('backtest.sortinoRatio')}
          value={metrics.sortino_ratio.toFixed(2)}
          positive={metrics.sortino_ratio > 1}
        />
        <MetricBox
          label={t('backtest.profitFactor')}
          value={typeof metrics.profit_factor === 'string' ? metrics.profit_factor : metrics.profit_factor.toFixed(2)}
          positive={metrics.profit_factor > 1}
        />
      </div>
      
      {/* Trade Summary */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('backtest.tradeSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('backtest.totalTrades')}</span>
              <span className="font-mono text-white">{metrics.total_trades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('backtest.finalEquity')}</span>
              <span className="font-mono text-white">${metrics.final_equity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('backtest.avgWin')}</span>
              <span className="font-mono text-neon-green">${metrics.avg_win.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('backtest.avgLoss')}</span>
              <span className="font-mono text-neon-red">${metrics.avg_loss.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MetricBox = ({ label, value, subValue, positive, neutral }) => (
  <div className="bg-secondary/50 rounded-lg p-3 text-center">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`font-mono text-lg font-bold ${
      neutral ? 'text-white' : positive ? 'text-neon-green' : 'text-neon-red'
    }`}>
      {value}
    </p>
    {subValue && (
      <p className="text-xs text-muted-foreground">{subValue}</p>
    )}
  </div>
);

export default BacktestPanel;
