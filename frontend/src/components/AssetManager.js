import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Search, Star, TrendingUp, Building2, Gem, DollarSign, BarChart3, X } from 'lucide-react';
import { useLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { toast } from 'sonner';
import { BACKEND_URL } from '../config/api';

const API_URL = BACKEND_URL;

// Asset type icons
const assetTypeIcons = {
  crypto: TrendingUp,
  stock: Building2,
  commodity: Gem,
  forex: DollarSign,
  index: BarChart3
};

// Asset type colors
const assetTypeColors = {
  crypto: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  stock: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  commodity: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  forex: 'bg-green-500/20 text-green-400 border-green-500/30',
  index: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

export const AssetManager = ({ watchlist, onWatchlistChange }) => {
  const { t } = useLanguage();
  const [allAssets, setAllAssets] = useState({});
  const [assetTypes, setAssetTypes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customAsset, setCustomAsset] = useState({
    symbol: '',
    name: '',
    asset_type: 'stock',
    currency: 'USD',
    base_price: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch all available assets on mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(`${API_URL}/api/assets/all`);
        if (response.ok) {
          const data = await response.json();
          setAllAssets(data.assets);
          setAssetTypes(data.types);
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      }
    };
    fetchAssets();
  }, []);

  // Filter assets based on search and type
  const filteredAssets = useMemo(() => {
    let result = [];
    
    Object.entries(allAssets).forEach(([type, assets]) => {
      if (selectedType === 'all' || selectedType === type) {
        assets.forEach(asset => {
          if (
            searchQuery === '' ||
            asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            result.push({ ...asset, type });
          }
        });
      }
    });
    
    return result;
  }, [allAssets, searchQuery, selectedType]);

  // Check if asset is in watchlist
  const isInWatchlist = (symbol) => {
    return watchlist?.includes(symbol);
  };

  // Add asset to watchlist
  const addToWatchlist = async (symbol) => {
    if (isInWatchlist(symbol)) return;
    
    const newWatchlist = [...(watchlist || []), symbol];
    try {
      const response = await fetch(`${API_URL}/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWatchlist)
      });
      
      if (response.ok) {
        onWatchlistChange(newWatchlist);
        toast.success(t('assets.assetAdded'));
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  // Remove asset from watchlist
  const removeFromWatchlist = async (symbol) => {
    const newWatchlist = watchlist.filter(s => s !== symbol);
    try {
      const response = await fetch(`${API_URL}/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWatchlist)
      });
      
      if (response.ok) {
        onWatchlistChange(newWatchlist);
        toast.success(t('assets.assetRemoved'));
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  // Add custom asset
  const handleAddCustomAsset = async () => {
    if (!customAsset.symbol || !customAsset.name) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/assets/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customAsset,
          base_price: customAsset.base_price ? parseFloat(customAsset.base_price) : null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Refresh assets
        const assetsResponse = await fetch(`${API_URL}/api/assets/all`);
        if (assetsResponse.ok) {
          const assetsData = await assetsResponse.json();
          setAllAssets(assetsData.assets);
        }
        // Add to watchlist
        await addToWatchlist(customAsset.symbol.toUpperCase());
        setShowAddCustom(false);
        setCustomAsset({
          symbol: '',
          name: '',
          asset_type: 'stock',
          currency: 'USD',
          base_price: ''
        });
        toast.success(t('assets.assetAdded'));
      }
    } catch (error) {
      console.error('Failed to add custom asset:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="asset-manager">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('assets.searchAssets')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border"
            data-testid="asset-search-input"
          />
        </div>
        <Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
          <DialogTrigger asChild>
            <Button className="bg-neon-green hover:bg-neon-green/90 text-black" data-testid="add-custom-asset-btn">
              <Plus className="w-4 h-4 mr-2" />
              {t('assets.addCustomAsset')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{t('assets.createCustom')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">{t('assets.customAssetDesc')}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('assets.symbol')}</Label>
                  <Input
                    placeholder="AAPL, GOLD, etc."
                    value={customAsset.symbol}
                    onChange={(e) => setCustomAsset({ ...customAsset, symbol: e.target.value.toUpperCase() })}
                    className="bg-background border-border"
                    data-testid="custom-symbol-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('assets.name')}</Label>
                  <Input
                    placeholder="Apple Inc., Gold, etc."
                    value={customAsset.name}
                    onChange={(e) => setCustomAsset({ ...customAsset, name: e.target.value })}
                    className="bg-background border-border"
                    data-testid="custom-name-input"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('assets.type')}</Label>
                  <Select
                    value={customAsset.asset_type}
                    onValueChange={(value) => setCustomAsset({ ...customAsset, asset_type: value })}
                  >
                    <SelectTrigger className="bg-background border-border" data-testid="custom-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="crypto">{t('assets.assetTypes.crypto')}</SelectItem>
                      <SelectItem value="stock">{t('assets.assetTypes.stock')}</SelectItem>
                      <SelectItem value="commodity">{t('assets.assetTypes.commodity')}</SelectItem>
                      <SelectItem value="forex">{t('assets.assetTypes.forex')}</SelectItem>
                      <SelectItem value="index">{t('assets.assetTypes.index')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('assets.currency')}</Label>
                  <Select
                    value={customAsset.currency}
                    onValueChange={(value) => setCustomAsset({ ...customAsset, currency: value })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">{t('assets.basePrice')} (optional)</Label>
                <Input
                  type="number"
                  placeholder="100.00"
                  value={customAsset.base_price}
                  onChange={(e) => setCustomAsset({ ...customAsset, base_price: e.target.value })}
                  className="bg-background border-border"
                  data-testid="custom-price-input"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowAddCustom(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleAddCustomAsset} 
                disabled={loading || !customAsset.symbol || !customAsset.name}
                className="bg-neon-green hover:bg-neon-green/90 text-black"
                data-testid="confirm-add-asset-btn"
              >
                {loading ? t('common.loading') : t('assets.addAsset')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Watchlist */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4 text-neon-green" />
            {t('assets.watchlist')} ({watchlist?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {watchlist?.map((symbol) => {
              // Find the asset type
              let assetType = 'crypto';
              Object.entries(allAssets).forEach(([type, assets]) => {
                if (assets.some(a => a.symbol === symbol)) {
                  assetType = type;
                }
              });
              const Icon = assetTypeIcons[assetType] || TrendingUp;
              
              return (
                <Badge 
                  key={symbol} 
                  variant="outline" 
                  className={`${assetTypeColors[assetType]} px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  <Icon className="w-3 h-3 mr-1.5" />
                  {symbol}
                  <button
                    onClick={() => removeFromWatchlist(symbol)}
                    className="ml-2 hover:text-red-400 transition-colors"
                    data-testid={`remove-${symbol}-btn`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {(!watchlist || watchlist.length === 0) && (
              <p className="text-sm text-muted-foreground">{t('assets.noAssetsFound')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Assets by Type */}
      <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto">
          <TabsTrigger value="all" className="data-[state=active]:bg-white/10 text-xs">
            {t('assets.all')}
          </TabsTrigger>
          {Object.entries(assetTypes).map(([key, label]) => {
            const Icon = assetTypeIcons[key] || TrendingUp;
            return (
              <TabsTrigger 
                key={key} 
                value={key} 
                className="data-[state=active]:bg-white/10 text-xs"
              >
                <Icon className="w-3 h-3 mr-1" />
                {t(`assets.assetTypes.${key}`)}
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        <TabsContent value={selectedType} className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredAssets.map((asset) => {
              const Icon = assetTypeIcons[asset.type] || TrendingUp;
              const inWatchlist = isInWatchlist(asset.symbol);
              
              return (
                <div
                  key={asset.symbol}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    inWatchlist 
                      ? 'bg-neon-green/10 border-neon-green/30' 
                      : 'bg-secondary/30 border-border hover:border-white/20'
                  }`}
                  data-testid={`asset-${asset.symbol}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${assetTypeColors[asset.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{asset.symbol}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{asset.name}</p>
                    </div>
                  </div>
                  
                  {inWatchlist ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWatchlist(asset.symbol)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      data-testid={`remove-watchlist-${asset.symbol}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addToWatchlist(asset.symbol)}
                      className="text-neon-green hover:text-neon-green hover:bg-neon-green/10"
                      data-testid={`add-watchlist-${asset.symbol}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
            
            {filteredAssets.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {t('assets.noAssetsFound')}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetManager;
