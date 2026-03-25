import React from 'react';
import { useLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SettingsPanel } from '../components/SettingsPanel';
import { Settings, Info } from 'lucide-react';

const SettingsPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4" data-testid="settings-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('settings.subtitle')}
        </p>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t('settings.configuration')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SettingsPanel />
            </CardContent>
          </Card>
        </div>
        
        {/* Info Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                {t('settings.quickGuide')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-white mb-1">{t('settings.indicators')}</h4>
                <p className="text-muted-foreground">
                  {t('settings.indicatorsGuide')}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-1">{t('settings.strategyWeights')}</h4>
                <p className="text-muted-foreground">
                  {t('settings.strategyGuide')}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-1">{t('settings.riskManagement')}</h4>
                <p className="text-muted-foreground">
                  {t('settings.riskGuide')}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-1">{t('settings.aiConfiguration')}</h4>
                <p className="text-muted-foreground">
                  {t('settings.aiGuide')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('settings.tradingMode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3">
                <p className="text-neon-green font-medium text-sm mb-1">{t('settings.simulationMode')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('settings.simulationDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('settings.aboutSpectroBot')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-2">
                {t('settings.aboutDesc')}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('settings.feature1')}</li>
                <li>{t('settings.feature2')}</li>
                <li>{t('settings.feature3')}</li>
                <li>{t('settings.feature4')}</li>
                <li>{t('settings.feature5')}</li>
                <li>{t('settings.feature6')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
