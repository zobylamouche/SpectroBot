import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle, Brain, Sparkles } from 'lucide-react';
import { useTradingContext } from '../context/TradingContext';
import { useLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export const SignalCard = () => {
  const { signal, loading, fetchSignal } = useTradingContext();
  const { t } = useLanguage();
  
  const getSignalColor = (sig) => {
    switch (sig?.toUpperCase()) {
      case 'BUY': return 'bg-neon-green/20 text-neon-green border-neon-green/30';
      case 'SELL': return 'bg-neon-red/20 text-neon-red border-neon-red/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };
  
  const getSignalIcon = (sig) => {
    switch (sig?.toUpperCase()) {
      case 'BUY': return <ArrowUpCircle className="w-8 h-8 text-neon-green" />;
      case 'SELL': return <ArrowDownCircle className="w-8 h-8 text-neon-red" />;
      default: return <MinusCircle className="w-8 h-8 text-white/50" />;
    }
  };

  const translateSignal = (sig) => {
    switch (sig?.toUpperCase()) {
      case 'BUY': return t('signals.buy');
      case 'SELL': return t('signals.sell');
      default: return t('signals.hold');
    }
  };
  
  return (
    <Card className="bg-card border-border" data-testid="signal-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {t('dashboard.strategySignal')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading.signal && !signal ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
          </div>
        ) : signal ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSignalIcon(signal.signal?.signal)}
                <div>
                  <Badge className={`text-lg px-3 py-1 ${getSignalColor(signal.signal?.signal)}`}>
                    {translateSignal(signal.signal?.signal)}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('strategies.' + (signal.strategy || 'composite'))}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold text-white">
                  {((signal.signal?.confidence || 0) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">{t('dashboard.confidence')}</p>
              </div>
            </div>
            
            {signal.signal?.individual_signals && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                {Object.entries(signal.signal.individual_signals).map(([strategy, sig]) => (
                  <div key={strategy} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground capitalize">
                      {t('strategies.' + strategy) || strategy.replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className={`text-xs ${getSignalColor(sig)}`}>
                      {translateSignal(sig)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => fetchSignal()}
              data-testid="refresh-signal-btn"
            >
              {t('dashboard.refreshSignal')}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-muted-foreground">
            {t('common.loading')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MLPredictionCard = () => {
  const { mlPrediction, loading, trainMLModel, fetchMLPrediction } = useTradingContext();
  const { t } = useLanguage();
  const [isTraining, setIsTraining] = React.useState(false);
  
  const handleTrain = async () => {
    setIsTraining(true);
    await trainMLModel();
    await fetchMLPrediction();
    setIsTraining(false);
  };
  
  return (
    <Card className="bg-card border-border" data-testid="ml-prediction-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Brain className="w-4 h-4" />
          {t('dashboard.mlPrediction')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading.ml || isTraining ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">
              {isTraining ? t('common.loading') : t('common.loading')}
            </div>
          </div>
        ) : mlPrediction?.prediction?.success ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {mlPrediction.prediction.direction === 'UP' ? (
                  <ArrowUpCircle className="w-8 h-8 text-neon-green" />
                ) : (
                  <ArrowDownCircle className="w-8 h-8 text-neon-red" />
                )}
                <div>
                  <Badge className={`text-lg px-3 py-1 ${
                    mlPrediction.prediction.direction === 'UP'
                      ? 'bg-neon-green/20 text-neon-green border-neon-green/30'
                      : 'bg-neon-red/20 text-neon-red border-neon-red/30'
                  }`}>
                    {mlPrediction.prediction.direction === 'UP' ? t('signals.up') : t('signals.down')}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold text-white">
                  {(mlPrediction.prediction.direction_probability * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">{t('dashboard.confidence')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="bg-secondary/50 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">{t('dashboard.predictedChange')}</p>
                <p className={`font-mono text-sm font-bold ${
                  mlPrediction.prediction.predicted_price_change_pct >= 0 
                    ? 'text-neon-green' 
                    : 'text-neon-red'
                }`}>
                  {mlPrediction.prediction.predicted_price_change_pct >= 0 ? '+' : ''}
                  {mlPrediction.prediction.predicted_price_change_pct.toFixed(2)}%
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">{t('dashboard.targetPrice')}</p>
                <p className="font-mono text-sm font-bold text-white">
                  ${mlPrediction.prediction.predicted_price?.toLocaleString()}
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleTrain}
              data-testid="train-ml-btn"
            >
              {t('dashboard.retrainPredict')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
              {mlPrediction?.prediction?.error || t('dashboard.modelNotTrained')}
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full"
              onClick={handleTrain}
              data-testid="train-ml-btn"
            >
              {t('dashboard.trainModel')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AIAnalysisCard = () => {
  const { aiAnalysis, loading, fetchAIAnalysis, selectedSymbol } = useTradingContext();
  const { t, getLanguageName } = useLanguage();
  
  const handleRefresh = () => {
    const langName = getLanguageName();
    fetchAIAnalysis(selectedSymbol, langName);
  };
  
  return (
    <Card className="bg-card border-border" data-testid="ai-analysis-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-blue" />
          {t('dashboard.aiAnalysis')}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleRefresh}
          disabled={loading.ai}
          data-testid="refresh-ai-btn"
        >
          {loading.ai ? t('common.loading') : t('dashboard.refreshAnalysis')}
        </Button>
      </CardHeader>
      <CardContent>
        {loading.ai ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">{t('dashboard.generatingAnalysis')}</div>
          </div>
        ) : aiAnalysis?.llm_analysis?.success ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
              {aiAnalysis.llm_analysis.analysis}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <p className="text-muted-foreground text-sm">
              {aiAnalysis?.llm_analysis?.error || t('dashboard.clickRefresh')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignalCard;
