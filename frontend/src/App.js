import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { TradingProvider, useTradingContext } from './context/TradingContext';
import { LanguageProvider, useLanguage } from './i18n';
import { 
  LayoutDashboard, 
  LineChart, 
  FlaskConical, 
  Settings, 
  Activity,
  Wifi,
  WifiOff,
  ChevronDown,
  Globe,
  Info
} from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './components/ui/dialog';

// Pages
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Backtest from './pages/Backtest';
import SettingsPage from './pages/SettingsPage';
import { BACKEND_URL } from './config/api';

import './App.css';

// Footer Component with Version
const Footer = () => {
  const { t } = useLanguage();
  const [versionInfo, setVersionInfo] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const API_URL = BACKEND_URL;
  
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch(`${API_URL}/api/version`);
        if (response.ok) {
          const data = await response.json();
          setVersionInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch version:', error);
      }
    };
    fetchVersion();
  }, [API_URL]);
  
  if (!versionInfo) return null;
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-sm border-t border-border z-40">
      <div className="max-w-[1800px] mx-auto px-4 h-8 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium text-white">{versionInfo.name}</span>
          <Dialog open={showChangelog} onOpenChange={setShowChangelog}>
            <DialogTrigger asChild>
              <button 
                className="flex items-center gap-1 hover:text-neon-green transition-colors cursor-pointer"
                data-testid="version-info-btn"
              >
                <Info className="w-3 h-3" />
                <span>v{versionInfo.version}</span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-neon-green" />
                  {versionInfo.name} - {t('version.changelog')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('version.currentVersion')}</span>
                  <span className="font-mono text-neon-green">v{versionInfo.version}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('version.buildDate')}</span>
                  <span className="font-mono">{versionInfo.build_date}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium mb-3">{t('version.changelog')}</h4>
                  {Object.entries(versionInfo.changelog || {}).map(([ver, info]) => (
                    <div key={ver} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-neon-green text-sm">v{ver}</span>
                        <span className="text-xs text-muted-foreground">({info.date})</span>
                      </div>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {info.changes.map((change, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-neon-green mt-1">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-xs text-muted-foreground">
          {versionInfo.build_date}
        </div>
      </div>
    </footer>
  );
};

const Navigation = () => {
  const { wsConnected, selectedSymbol, setSelectedSymbol } = useTradingContext();
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
    { path: '/trading', icon: LineChart, labelKey: 'nav.trading' },
    { path: '/backtest', icon: FlaskConical, labelKey: 'nav.backtest' },
    { path: '/settings', icon: Settings, labelKey: 'nav.settings' }
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-border">
      <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-neon-green" />
            <span className="font-heading font-black text-xl text-white tracking-tight">
              SpectroBot
            </span>
          </div>
          
          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`
                }
                data-testid={`nav-${item.labelKey.split('.')[1]}`}
              >
                <item.icon className="w-4 h-4" />
                {t(item.labelKey)}
              </NavLink>
            ))}
          </div>
        </div>
        
        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white" data-testid="language-selector">
                <Globe className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              {availableLanguages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`cursor-pointer ${language === lang.code ? 'bg-neon-green/10 text-neon-green' : ''}`}
                >
                  {lang.flag} {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Symbol Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border bg-secondary/50" data-testid="symbol-selector">
                {selectedSymbol.replace('USDT', '/USDT')}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'].map((symbol) => (
                <DropdownMenuItem
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className="cursor-pointer"
                >
                  {symbol.replace('USDT', '/USDT')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            wsConnected 
              ? 'bg-neon-green/10 text-neon-green' 
              : 'bg-neon-red/10 text-neon-red'
          }`}>
            {wsConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>{t('nav.live')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>{t('nav.offline')}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-around border-t border-border py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-md text-xs ${
                isActive
                  ? 'text-neon-green'
                  : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Navigation />
      
      <main className="pt-14 md:pt-14 pb-12">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <TradingProvider>
          <AppContent />
        </TradingProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
