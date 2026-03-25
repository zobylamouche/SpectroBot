import React, { useState } from 'react';
import { Save, RefreshCw, Wallet } from 'lucide-react';
import { useTradingContext } from '../context/TradingContext';
import { useLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { AssetManager } from './AssetManager';

export const SettingsPanel = () => {
  const { settings, updateSettings, fetchSettings, watchlist, setWatchlist } = useTradingContext();
  const { t } = useLanguage();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  
  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);
  
  const handleSave = async () => {
    setIsSaving(true);
    await updateSettings(localSettings);
    setIsSaving(false);
  };
  
  const handleReset = async () => {
    await fetchSettings();
  };
  
  if (!localSettings) {
    return (
      <div className="flex items-center justify-center h-48" data-testid="settings-loading">
        <div className="animate-pulse text-muted-foreground">{t('settings.loadingSettings')}</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4" data-testid="settings-panel">
      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-secondary/50">
          <TabsTrigger value="assets" className="data-[state=active]:bg-white/10 text-xs">
            <Wallet className="w-3 h-3 mr-1" />
            {t('assets.watchlist')}
          </TabsTrigger>
          <TabsTrigger value="indicators" className="data-[state=active]:bg-white/10 text-xs">
            {t('settings.indicators')}
          </TabsTrigger>
          <TabsTrigger value="strategy" className="data-[state=active]:bg-white/10 text-xs">
            {t('settings.strategy')}
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-white/10 text-xs">
            {t('settings.risk')}
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-white/10 text-xs">
            {t('settings.ai')}
          </TabsTrigger>
        </TabsList>
        
        {/* Assets Tab */}
        <TabsContent value="assets" className="mt-4">
          <AssetManager watchlist={watchlist} onWatchlistChange={setWatchlist} />
        </TabsContent>
        
        {/* Indicators Tab */}
        <TabsContent value="indicators" className="space-y-4 mt-4">
          <Card className="bg-secondary/30 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('settings.emaSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.short')}</Label>
                  <Input
                    type="number"
                    value={localSettings.indicator_config?.ema_short || 9}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      indicator_config: {
                        ...localSettings.indicator_config,
                        ema_short: parseInt(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                    data-testid="ema-short-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.long')}</Label>
                  <Input
                    type="number"
                    value={localSettings.indicator_config?.ema_long || 21}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      indicator_config: {
                        ...localSettings.indicator_config,
                        ema_long: parseInt(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                    data-testid="ema-long-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.trend')}</Label>
                  <Input
                    type="number"
                    value={localSettings.indicator_config?.ema_trend || 50}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      indicator_config: {
                        ...localSettings.indicator_config,
                        ema_trend: parseInt(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                    data-testid="ema-trend-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('settings.rsiSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('settings.period')}</Label>
                <Input
                  type="number"
                  value={localSettings.indicator_config?.rsi_period || 14}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    indicator_config: {
                      ...localSettings.indicator_config,
                      rsi_period: parseInt(e.target.value)
                    }
                  })}
                  className="bg-background border-border"
                  data-testid="rsi-period-input"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('settings.supertrendSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.period')}</Label>
                  <Input
                    type="number"
                    value={localSettings.indicator_config?.supertrend_period || 10}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      indicator_config: {
                        ...localSettings.indicator_config,
                        supertrend_period: parseInt(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                    data-testid="supertrend-period-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.multiplier')}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={localSettings.indicator_config?.supertrend_multiplier || 3.0}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      indicator_config: {
                        ...localSettings.indicator_config,
                        supertrend_multiplier: parseFloat(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                    data-testid="supertrend-multiplier-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4 mt-4">
          <Card className="bg-secondary/30 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('settings.strategyWeights')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">{t('settings.emaCrossover')}</Label>
                    <span className="text-xs font-mono text-white">
                      {((localSettings.strategy_config?.ema_crossover_weight || 0.25) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[(localSettings.strategy_config?.ema_crossover_weight || 0.25) * 100]}
                    onValueChange={([v]) => setLocalSettings({
                      ...localSettings,
                      strategy_config: {
                        ...localSettings.strategy_config,
                        ema_crossover_weight: v / 100
                      }
                    })}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">{t('settings.emaRsi')}</Label>
                    <span className="text-xs font-mono text-white">
                      {((localSettings.strategy_config?.ema_rsi_weight || 0.25) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[(localSettings.strategy_config?.ema_rsi_weight || 0.25) * 100]}
                    onValueChange={([v]) => setLocalSettings({
                      ...localSettings,
                      strategy_config: {
                        ...localSettings.strategy_config,
                        ema_rsi_weight: v / 100
                      }
                    })}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">{t('settings.macd')}</Label>
                    <span className="text-xs font-mono text-white">
                      {((localSettings.strategy_config?.macd_weight || 0.25) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[(localSettings.strategy_config?.macd_weight || 0.25) * 100]}
                    onValueChange={([v]) => setLocalSettings({
                      ...localSettings,
                      strategy_config: {
                        ...localSettings.strategy_config,
                        macd_weight: v / 100
                      }
                    })}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">{t('settings.supertrend')}</Label>
                    <span className="text-xs font-mono text-white">
                      {((localSettings.strategy_config?.supertrend_weight || 0.25) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    value={[(localSettings.strategy_config?.supertrend_weight || 0.25) * 100]}
                    onValueChange={([v]) => setLocalSettings({
                      ...localSettings,
                      strategy_config: {
                        ...localSettings.strategy_config,
                        supertrend_weight: v / 100
                      }
                    })}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('settings.rsiThresholds')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.overbought')}</Label>
                  <Input
                    type="number"
                    value={localSettings.strategy_config?.rsi_overbought || 70}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      strategy_config: {
                        ...localSettings.strategy_config,
                        rsi_overbought: parseFloat(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.oversold')}</Label>
                  <Input
                    type="number"
                    value={localSettings.strategy_config?.rsi_oversold || 30}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      strategy_config: {
                        ...localSettings.strategy_config,
                        rsi_oversold: parseFloat(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Risk Tab */}
        <TabsContent value="risk" className="space-y-4 mt-4">
          <Card className="bg-secondary/30 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('settings.riskManagement')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.maxPositionSize')}</Label>
                  <Input
                    type="number"
                    value={localSettings.risk_config?.max_position_size_pct || 20}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      risk_config: {
                        ...localSettings.risk_config,
                        max_position_size_pct: parseFloat(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.maxDailyLoss')}</Label>
                  <Input
                    type="number"
                    value={localSettings.risk_config?.max_daily_loss_pct || 10}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      risk_config: {
                        ...localSettings.risk_config,
                        max_daily_loss_pct: parseFloat(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.defaultStopLoss')}</Label>
                  <Input
                    type="number"
                    value={localSettings.risk_config?.stop_loss_pct || 5}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      risk_config: {
                        ...localSettings.risk_config,
                        stop_loss_pct: parseFloat(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('settings.defaultTakeProfit')}</Label>
                  <Input
                    type="number"
                    value={localSettings.risk_config?.take_profit_pct || 10}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      risk_config: {
                        ...localSettings.risk_config,
                        take_profit_pct: parseFloat(e.target.value)
                      }
                    })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card className="bg-secondary/30 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('settings.aiConfiguration')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t('settings.enableMl')}</Label>
                <Switch
                  checked={localSettings.ai_config?.ml_enabled ?? true}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    ai_config: {
                      ...localSettings.ai_config,
                      ml_enabled: checked
                    }
                  })}
                  data-testid="ml-enabled-switch"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t('settings.enableLlm')}</Label>
                <Switch
                  checked={localSettings.ai_config?.llm_enabled ?? true}
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    ai_config: {
                      ...localSettings.ai_config,
                      llm_enabled: checked
                    }
                  })}
                  data-testid="llm-enabled-switch"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">{t('settings.confidenceThreshold')}</Label>
                  <span className="text-xs font-mono text-white">
                    {((localSettings.ai_config?.confidence_threshold || 0.7) * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[(localSettings.ai_config?.confidence_threshold || 0.7) * 100]}
                  onValueChange={([v]) => setLocalSettings({
                    ...localSettings,
                    ai_config: {
                      ...localSettings.ai_config,
                      confidence_threshold: v / 100
                    }
                  })}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('settings.predictionHorizon')}</Label>
                <Input
                  type="number"
                  value={localSettings.ai_config?.prediction_horizon || 5}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    ai_config: {
                      ...localSettings.ai_config,
                      prediction_horizon: parseInt(e.target.value)
                    }
                  })}
                  className="bg-background border-border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Save / Reset Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleReset}
          data-testid="reset-settings-btn"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('settings.reset')}
        </Button>
        <Button
          className="flex-1 bg-neon-green hover:bg-neon-green/90 text-black"
          onClick={handleSave}
          disabled={isSaving}
          data-testid="save-settings-btn"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? t('settings.saving') : t('settings.saveSettings')}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
