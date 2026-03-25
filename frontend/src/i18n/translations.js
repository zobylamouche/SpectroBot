// Translation files for SpectroBot - Multi-language support

export const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      trading: "Trading",
      backtest: "Backtest",
      settings: "Settings",
      live: "Live",
      offline: "Offline"
    },
    
    // Dashboard
    dashboard: {
      title: "Dashboard",
      subtitle: "Real-time market analysis and trading signals",
      watchlist: "Watchlist",
      priceChart: "Price Chart",
      strategySignal: "Strategy Signal",
      mlPrediction: "ML Prediction",
      virtualPortfolio: "Virtual Portfolio",
      aiAnalysis: "AI Analysis (GPT-5.2)",
      confidence: "Confidence",
      refreshSignal: "Refresh Signal",
      trainModel: "Train ML Model",
      retrainPredict: "Retrain & Predict",
      modelNotTrained: "Model not trained yet",
      predictedChange: "Predicted Change",
      targetPrice: "Target Price",
      refreshAnalysis: "Refresh",
      generatingAnalysis: "Generating analysis...",
      clickRefresh: "Click refresh to generate AI analysis"
    },
    
    // Trading
    trading: {
      title: "Trading",
      subtitle: "Execute trades and monitor positions",
      buy: "Buy",
      sell: "Sell",
      currentPrice: "Current Price",
      quantity: "Quantity",
      tradeValue: "Trade Value",
      available: "Available",
      executing: "Executing...",
      createPortfolioFirst: "Create a portfolio first to start trading",
      tradeHistory: "Trade History",
      noTrades: "No trades yet"
    },
    
    // Portfolio
    portfolio: {
      title: "Virtual Portfolio",
      totalValue: "Total Value",
      available: "Available",
      initial: "Initial",
      openPositions: "Open Positions",
      createPortfolio: "Create Portfolio",
      creating: "Creating...",
      portfolioName: "Portfolio Name",
      initialCapital: "Initial Capital ($)",
      createToStart: "Create a virtual portfolio to start trading"
    },
    
    // Backtest
    backtest: {
      title: "Backtesting",
      subtitle: "Test strategies on historical data",
      configuration: "Configuration",
      results: "Results",
      strategy: "Strategy",
      interval: "Interval",
      initialCapital: "Initial Capital ($)",
      positionSize: "Position Size (%)",
      stopLoss: "Stop Loss (%)",
      takeProfit: "Take Profit (%)",
      optional: "Optional",
      runBacktest: "Run Backtest",
      runningSimulation: "Running Simulation...",
      noResults: "No Backtest Results",
      configureAndRun: "Configure your backtest parameters and click \"Run Backtest\" to see results.",
      equityCurve: "Equity Curve",
      netProfit: "Net Profit",
      winRate: "Win Rate",
      maxDrawdown: "Max Drawdown",
      sharpeRatio: "Sharpe Ratio",
      sortinoRatio: "Sortino Ratio",
      profitFactor: "Profit Factor",
      tradeSummary: "Trade Summary",
      totalTrades: "Total Trades",
      finalEquity: "Final Equity",
      avgWin: "Avg Win",
      avgLoss: "Avg Loss",
      tradeLog: "Trade Log"
    },
    
    // Settings
    settings: {
      title: "Settings",
      subtitle: "Configure indicators, strategies, risk management, and AI settings",
      configuration: "Configuration",
      indicators: "Indicators",
      strategy: "Strategy",
      risk: "Risk",
      ai: "AI",
      emaSettings: "EMA Settings",
      short: "Short",
      long: "Long",
      trend: "Trend",
      rsiSettings: "RSI Settings",
      period: "Period",
      supertrendSettings: "SuperTrend Settings",
      multiplier: "Multiplier",
      strategyWeights: "Strategy Weights",
      emaCrossover: "EMA Crossover",
      emaRsi: "EMA + RSI",
      macd: "MACD",
      supertrend: "SuperTrend",
      rsiThresholds: "RSI Thresholds",
      overbought: "Overbought",
      oversold: "Oversold",
      riskManagement: "Risk Management",
      maxPositionSize: "Max Position Size (%)",
      maxDailyLoss: "Max Daily Loss (%)",
      defaultStopLoss: "Default Stop Loss (%)",
      defaultTakeProfit: "Default Take Profit (%)",
      aiConfiguration: "AI Configuration",
      enableMl: "Enable ML Predictions",
      enableLlm: "Enable LLM Analysis",
      confidenceThreshold: "AI Confidence Threshold",
      predictionHorizon: "Prediction Horizon (candles)",
      reset: "Reset",
      saveSettings: "Save Settings",
      saving: "Saving...",
      loadingSettings: "Loading settings...",
      quickGuide: "Quick Guide",
      indicatorsGuide: "Configure technical indicators like EMA periods, RSI settings, and SuperTrend parameters.",
      strategyGuide: "Adjust the weight of each strategy in the composite signal. Higher weights give more influence.",
      riskGuide: "Set position sizes, stop-loss, and take-profit levels to manage your risk exposure.",
      aiGuide: "Enable/disable ML predictions and LLM analysis. Set confidence thresholds for trade recommendations.",
      tradingMode: "Trading Mode",
      simulationMode: "Simulation Mode",
      simulationDesc: "All trades are executed with virtual capital. No real funds at risk.",
      aboutSpectroBot: "About SpectroBot",
      aboutDesc: "SpectroBot is an algorithmic trading platform featuring:",
      feature1: "Real-time market data via Binance",
      feature2: "Technical indicators (EMA, RSI, MACD, ATR, SuperTrend)",
      feature3: "Multiple trading strategies",
      feature4: "ML-based price prediction",
      feature5: "GPT-5.2 market analysis",
      feature6: "Advanced backtesting",
      language: "Language"
    },
    
    // Signals
    signals: {
      buy: "BUY",
      sell: "SELL",
      hold: "HOLD",
      bullish: "Bullish",
      bearish: "Bearish",
      up: "UP",
      down: "DOWN"
    },
    
    // Time intervals
    intervals: {
      "1m": "1 Minute",
      "5m": "5 Minutes",
      "15m": "15 Minutes",
      "30m": "30 Minutes",
      "1h": "1 Hour",
      "4h": "4 Hours",
      "1d": "1 Day",
      "1w": "1 Week"
    },
    
    // Strategies
    strategies: {
      composite: "Composite",
      ema_crossover: "EMA Crossover",
      ema_rsi: "EMA + RSI",
      macd: "MACD",
      supertrend: "SuperTrend"
    },
    
    // Common
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      close: "Close",
      dataPoints: "Data Points"
    },
    
    // Version
    version: {
      title: "Version",
      buildDate: "Build Date",
      changelog: "Changelog",
      currentVersion: "Current Version"
    },
    
    // Assets
    assets: {
      title: "Assets Management",
      subtitle: "Configure your watchlist with crypto, stocks, commodities and more",
      watchlist: "Watchlist",
      addAsset: "Add Asset",
      removeAsset: "Remove",
      customAsset: "Custom Asset",
      availableAssets: "Available Assets",
      assetTypes: {
        crypto: "Cryptocurrency",
        stock: "Stocks",
        commodity: "Commodities",
        forex: "Forex",
        index: "Indices"
      },
      symbol: "Symbol",
      name: "Name",
      type: "Type",
      currency: "Currency",
      basePrice: "Base Price",
      addToWatchlist: "Add to Watchlist",
      removeFromWatchlist: "Remove from Watchlist",
      searchAssets: "Search assets...",
      noAssetsFound: "No assets found",
      createCustom: "Create Custom Asset",
      addCustomAsset: "Add Custom Asset",
      customAssetDesc: "Add any asset not in the default list",
      assetAdded: "Asset added to watchlist",
      assetRemoved: "Asset removed from watchlist",
      popular: "Popular",
      all: "All"
    }
  },
  
  fr: {
    // Navigation
    nav: {
      dashboard: "Tableau de bord",
      trading: "Trading",
      backtest: "Backtest",
      settings: "Paramètres",
      live: "En direct",
      offline: "Hors ligne"
    },
    
    // Dashboard
    dashboard: {
      title: "Tableau de bord",
      subtitle: "Analyse de marché en temps réel et signaux de trading",
      watchlist: "Liste de suivi",
      priceChart: "Graphique des prix",
      strategySignal: "Signal de stratégie",
      mlPrediction: "Prédiction ML",
      virtualPortfolio: "Portefeuille virtuel",
      aiAnalysis: "Analyse IA (GPT-5.2)",
      confidence: "Confiance",
      refreshSignal: "Actualiser le signal",
      trainModel: "Entraîner le modèle ML",
      retrainPredict: "Réentraîner et prédire",
      modelNotTrained: "Modèle non entraîné",
      predictedChange: "Variation prédite",
      targetPrice: "Prix cible",
      refreshAnalysis: "Actualiser",
      generatingAnalysis: "Génération de l'analyse...",
      clickRefresh: "Cliquez sur actualiser pour générer l'analyse IA"
    },
    
    // Trading
    trading: {
      title: "Trading",
      subtitle: "Exécutez des trades et suivez vos positions",
      buy: "Acheter",
      sell: "Vendre",
      currentPrice: "Prix actuel",
      quantity: "Quantité",
      tradeValue: "Valeur du trade",
      available: "Disponible",
      executing: "Exécution...",
      createPortfolioFirst: "Créez d'abord un portefeuille pour commencer à trader",
      tradeHistory: "Historique des trades",
      noTrades: "Aucun trade"
    },
    
    // Portfolio
    portfolio: {
      title: "Portefeuille virtuel",
      totalValue: "Valeur totale",
      available: "Disponible",
      initial: "Initial",
      openPositions: "Positions ouvertes",
      createPortfolio: "Créer le portefeuille",
      creating: "Création...",
      portfolioName: "Nom du portefeuille",
      initialCapital: "Capital initial ($)",
      createToStart: "Créez un portefeuille virtuel pour commencer à trader"
    },
    
    // Backtest
    backtest: {
      title: "Backtesting",
      subtitle: "Testez vos stratégies sur des données historiques",
      configuration: "Configuration",
      results: "Résultats",
      strategy: "Stratégie",
      interval: "Intervalle",
      initialCapital: "Capital initial ($)",
      positionSize: "Taille de position (%)",
      stopLoss: "Stop Loss (%)",
      takeProfit: "Take Profit (%)",
      optional: "Optionnel",
      runBacktest: "Lancer le backtest",
      runningSimulation: "Simulation en cours...",
      noResults: "Aucun résultat",
      configureAndRun: "Configurez vos paramètres et cliquez sur \"Lancer le backtest\" pour voir les résultats.",
      equityCurve: "Courbe de capital",
      netProfit: "Profit net",
      winRate: "Taux de réussite",
      maxDrawdown: "Drawdown max",
      sharpeRatio: "Ratio de Sharpe",
      sortinoRatio: "Ratio de Sortino",
      profitFactor: "Facteur de profit",
      tradeSummary: "Résumé des trades",
      totalTrades: "Total des trades",
      finalEquity: "Capital final",
      avgWin: "Gain moyen",
      avgLoss: "Perte moyenne",
      tradeLog: "Journal des trades"
    },
    
    // Settings
    settings: {
      title: "Paramètres",
      subtitle: "Configurez les indicateurs, stratégies, gestion du risque et paramètres IA",
      configuration: "Configuration",
      indicators: "Indicateurs",
      strategy: "Stratégie",
      risk: "Risque",
      ai: "IA",
      emaSettings: "Paramètres EMA",
      short: "Court",
      long: "Long",
      trend: "Tendance",
      rsiSettings: "Paramètres RSI",
      period: "Période",
      supertrendSettings: "Paramètres SuperTrend",
      multiplier: "Multiplicateur",
      strategyWeights: "Poids des stratégies",
      emaCrossover: "Croisement EMA",
      emaRsi: "EMA + RSI",
      macd: "MACD",
      supertrend: "SuperTrend",
      rsiThresholds: "Seuils RSI",
      overbought: "Surachat",
      oversold: "Survente",
      riskManagement: "Gestion du risque",
      maxPositionSize: "Taille max de position (%)",
      maxDailyLoss: "Perte max journalière (%)",
      defaultStopLoss: "Stop Loss par défaut (%)",
      defaultTakeProfit: "Take Profit par défaut (%)",
      aiConfiguration: "Configuration IA",
      enableMl: "Activer les prédictions ML",
      enableLlm: "Activer l'analyse LLM",
      confidenceThreshold: "Seuil de confiance IA",
      predictionHorizon: "Horizon de prédiction (bougies)",
      reset: "Réinitialiser",
      saveSettings: "Enregistrer",
      saving: "Enregistrement...",
      loadingSettings: "Chargement des paramètres...",
      quickGuide: "Guide rapide",
      indicatorsGuide: "Configurez les indicateurs techniques comme les périodes EMA, RSI et les paramètres SuperTrend.",
      strategyGuide: "Ajustez le poids de chaque stratégie dans le signal composite. Un poids plus élevé donne plus d'influence.",
      riskGuide: "Définissez les tailles de position, stop-loss et take-profit pour gérer votre exposition au risque.",
      aiGuide: "Activez/désactivez les prédictions ML et l'analyse LLM. Définissez les seuils de confiance pour les recommandations.",
      tradingMode: "Mode de trading",
      simulationMode: "Mode simulation",
      simulationDesc: "Tous les trades sont exécutés avec du capital virtuel. Aucun risque réel.",
      aboutSpectroBot: "À propos de SpectroBot",
      aboutDesc: "SpectroBot est une plateforme de trading algorithmique incluant :",
      feature1: "Données de marché en temps réel via Binance",
      feature2: "Indicateurs techniques (EMA, RSI, MACD, ATR, SuperTrend)",
      feature3: "Stratégies de trading multiples",
      feature4: "Prédiction de prix par ML",
      feature5: "Analyse de marché GPT-5.2",
      feature6: "Backtesting avancé",
      language: "Langue"
    },
    
    // Signals
    signals: {
      buy: "ACHAT",
      sell: "VENTE",
      hold: "ATTENTE",
      bullish: "Haussier",
      bearish: "Baissier",
      up: "HAUSSE",
      down: "BAISSE"
    },
    
    // Time intervals
    intervals: {
      "1m": "1 Minute",
      "5m": "5 Minutes",
      "15m": "15 Minutes",
      "30m": "30 Minutes",
      "1h": "1 Heure",
      "4h": "4 Heures",
      "1d": "1 Jour",
      "1w": "1 Semaine"
    },
    
    // Strategies
    strategies: {
      composite: "Composite",
      ema_crossover: "Croisement EMA",
      ema_rsi: "EMA + RSI",
      macd: "MACD",
      supertrend: "SuperTrend"
    },
    
    // Common
    common: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      cancel: "Annuler",
      confirm: "Confirmer",
      close: "Fermer",
      dataPoints: "Points de données"
    },
    
    // Version
    version: {
      title: "Version",
      buildDate: "Date de compilation",
      changelog: "Journal des modifications",
      currentVersion: "Version actuelle"
    },
    
    // Assets
    assets: {
      title: "Gestion des actifs",
      subtitle: "Configurez votre liste de suivi avec crypto, actions, matières premières et plus",
      watchlist: "Liste de suivi",
      addAsset: "Ajouter un actif",
      removeAsset: "Supprimer",
      customAsset: "Actif personnalisé",
      availableAssets: "Actifs disponibles",
      assetTypes: {
        crypto: "Cryptomonnaies",
        stock: "Actions",
        commodity: "Matières premières",
        forex: "Forex",
        index: "Indices"
      },
      symbol: "Symbole",
      name: "Nom",
      type: "Type",
      currency: "Devise",
      basePrice: "Prix de base",
      addToWatchlist: "Ajouter à la liste",
      removeFromWatchlist: "Retirer de la liste",
      searchAssets: "Rechercher des actifs...",
      noAssetsFound: "Aucun actif trouvé",
      createCustom: "Créer un actif personnalisé",
      addCustomAsset: "Ajouter un actif personnalisé",
      customAssetDesc: "Ajoutez n'importe quel actif absent de la liste par défaut",
      assetAdded: "Actif ajouté à la liste de suivi",
      assetRemoved: "Actif retiré de la liste de suivi",
      popular: "Populaires",
      all: "Tous"
    }
  },
  
  es: {
    // Navigation
    nav: {
      dashboard: "Panel",
      trading: "Trading",
      backtest: "Backtest",
      settings: "Ajustes",
      live: "En vivo",
      offline: "Desconectado"
    },
    
    // Dashboard
    dashboard: {
      title: "Panel de Control",
      subtitle: "Análisis de mercado en tiempo real y señales de trading",
      watchlist: "Lista de seguimiento",
      priceChart: "Gráfico de precios",
      strategySignal: "Señal de estrategia",
      mlPrediction: "Predicción ML",
      virtualPortfolio: "Portafolio virtual",
      aiAnalysis: "Análisis IA (GPT-5.2)",
      confidence: "Confianza",
      refreshSignal: "Actualizar señal",
      trainModel: "Entrenar modelo ML",
      retrainPredict: "Reentrenar y predecir",
      modelNotTrained: "Modelo no entrenado",
      predictedChange: "Cambio previsto",
      targetPrice: "Precio objetivo",
      refreshAnalysis: "Actualizar",
      generatingAnalysis: "Generando análisis...",
      clickRefresh: "Haga clic en actualizar para generar análisis IA"
    },
    
    // Trading
    trading: {
      title: "Trading",
      subtitle: "Ejecute operaciones y monitoree posiciones",
      buy: "Comprar",
      sell: "Vender",
      currentPrice: "Precio actual",
      quantity: "Cantidad",
      tradeValue: "Valor de operación",
      available: "Disponible",
      executing: "Ejecutando...",
      createPortfolioFirst: "Cree un portafolio primero para comenzar a operar",
      tradeHistory: "Historial de operaciones",
      noTrades: "Sin operaciones"
    },
    
    // Portfolio
    portfolio: {
      title: "Portafolio virtual",
      totalValue: "Valor total",
      available: "Disponible",
      initial: "Inicial",
      openPositions: "Posiciones abiertas",
      createPortfolio: "Crear portafolio",
      creating: "Creando...",
      portfolioName: "Nombre del portafolio",
      initialCapital: "Capital inicial ($)",
      createToStart: "Cree un portafolio virtual para comenzar a operar"
    },
    
    // Backtest
    backtest: {
      title: "Backtesting",
      subtitle: "Pruebe estrategias con datos históricos",
      configuration: "Configuración",
      results: "Resultados",
      strategy: "Estrategia",
      interval: "Intervalo",
      initialCapital: "Capital inicial ($)",
      positionSize: "Tamaño de posición (%)",
      stopLoss: "Stop Loss (%)",
      takeProfit: "Take Profit (%)",
      optional: "Opcional",
      runBacktest: "Ejecutar backtest",
      runningSimulation: "Simulación en curso...",
      noResults: "Sin resultados",
      configureAndRun: "Configure sus parámetros y haga clic en \"Ejecutar backtest\" para ver resultados.",
      equityCurve: "Curva de capital",
      netProfit: "Beneficio neto",
      winRate: "Tasa de éxito",
      maxDrawdown: "Drawdown máximo",
      sharpeRatio: "Ratio de Sharpe",
      sortinoRatio: "Ratio de Sortino",
      profitFactor: "Factor de beneficio",
      tradeSummary: "Resumen de operaciones",
      totalTrades: "Total de operaciones",
      finalEquity: "Capital final",
      avgWin: "Ganancia promedio",
      avgLoss: "Pérdida promedio",
      tradeLog: "Registro de operaciones"
    },
    
    // Settings
    settings: {
      title: "Ajustes",
      subtitle: "Configure indicadores, estrategias, gestión de riesgo y ajustes de IA",
      configuration: "Configuración",
      indicators: "Indicadores",
      strategy: "Estrategia",
      risk: "Riesgo",
      ai: "IA",
      emaSettings: "Ajustes EMA",
      short: "Corto",
      long: "Largo",
      trend: "Tendencia",
      rsiSettings: "Ajustes RSI",
      period: "Período",
      supertrendSettings: "Ajustes SuperTrend",
      multiplier: "Multiplicador",
      strategyWeights: "Pesos de estrategias",
      emaCrossover: "Cruce EMA",
      emaRsi: "EMA + RSI",
      macd: "MACD",
      supertrend: "SuperTrend",
      rsiThresholds: "Umbrales RSI",
      overbought: "Sobrecompra",
      oversold: "Sobreventa",
      riskManagement: "Gestión de riesgo",
      maxPositionSize: "Tamaño máx. de posición (%)",
      maxDailyLoss: "Pérdida máx. diaria (%)",
      defaultStopLoss: "Stop Loss por defecto (%)",
      defaultTakeProfit: "Take Profit por defecto (%)",
      aiConfiguration: "Configuración IA",
      enableMl: "Activar predicciones ML",
      enableLlm: "Activar análisis LLM",
      confidenceThreshold: "Umbral de confianza IA",
      predictionHorizon: "Horizonte de predicción (velas)",
      reset: "Restablecer",
      saveSettings: "Guardar ajustes",
      saving: "Guardando...",
      loadingSettings: "Cargando ajustes...",
      quickGuide: "Guía rápida",
      indicatorsGuide: "Configure indicadores técnicos como períodos EMA, ajustes RSI y parámetros SuperTrend.",
      strategyGuide: "Ajuste el peso de cada estrategia en la señal compuesta. Mayor peso = más influencia.",
      riskGuide: "Establezca tamaños de posición, stop-loss y take-profit para gestionar su exposición al riesgo.",
      aiGuide: "Active/desactive predicciones ML y análisis LLM. Establezca umbrales de confianza para recomendaciones.",
      tradingMode: "Modo de trading",
      simulationMode: "Modo simulación",
      simulationDesc: "Todas las operaciones se ejecutan con capital virtual. Sin riesgo real.",
      aboutSpectroBot: "Acerca de SpectroBot",
      aboutDesc: "SpectroBot es una plataforma de trading algorítmico con:",
      feature1: "Datos de mercado en tiempo real via Binance",
      feature2: "Indicadores técnicos (EMA, RSI, MACD, ATR, SuperTrend)",
      feature3: "Múltiples estrategias de trading",
      feature4: "Predicción de precios con ML",
      feature5: "Análisis de mercado GPT-5.2",
      feature6: "Backtesting avanzado",
      language: "Idioma"
    },
    
    // Signals
    signals: {
      buy: "COMPRA",
      sell: "VENTA",
      hold: "ESPERAR",
      bullish: "Alcista",
      bearish: "Bajista",
      up: "ALZA",
      down: "BAJA"
    },
    
    // Time intervals
    intervals: {
      "1m": "1 Minuto",
      "5m": "5 Minutos",
      "15m": "15 Minutos",
      "30m": "30 Minutos",
      "1h": "1 Hora",
      "4h": "4 Horas",
      "1d": "1 Día",
      "1w": "1 Semana"
    },
    
    // Strategies
    strategies: {
      composite: "Compuesto",
      ema_crossover: "Cruce EMA",
      ema_rsi: "EMA + RSI",
      macd: "MACD",
      supertrend: "SuperTrend"
    },
    
    // Common
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      confirm: "Confirmar",
      close: "Cerrar",
      dataPoints: "Puntos de datos"
    },
    
    // Version
    version: {
      title: "Versión",
      buildDate: "Fecha de compilación",
      changelog: "Registro de cambios",
      currentVersion: "Versión actual"
    },
    
    // Assets
    assets: {
      title: "Gestión de activos",
      subtitle: "Configure su lista con criptomonedas, acciones, materias primas y más",
      watchlist: "Lista de seguimiento",
      addAsset: "Añadir activo",
      removeAsset: "Eliminar",
      customAsset: "Activo personalizado",
      availableAssets: "Activos disponibles",
      assetTypes: {
        crypto: "Criptomonedas",
        stock: "Acciones",
        commodity: "Materias primas",
        forex: "Forex",
        index: "Índices"
      },
      symbol: "Símbolo",
      name: "Nombre",
      type: "Tipo",
      currency: "Moneda",
      basePrice: "Precio base",
      addToWatchlist: "Añadir a la lista",
      removeFromWatchlist: "Quitar de la lista",
      searchAssets: "Buscar activos...",
      noAssetsFound: "No se encontraron activos",
      createCustom: "Crear activo personalizado",
      addCustomAsset: "Añadir activo personalizado",
      customAssetDesc: "Añada cualquier activo que no esté en la lista por defecto",
      assetAdded: "Activo añadido a la lista",
      assetRemoved: "Activo eliminado de la lista",
      popular: "Populares",
      all: "Todos"
    }
  },
  
  de: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      trading: "Trading",
      backtest: "Backtest",
      settings: "Einstellungen",
      live: "Live",
      offline: "Offline"
    },
    
    // Dashboard
    dashboard: {
      title: "Dashboard",
      subtitle: "Echtzeit-Marktanalyse und Trading-Signale",
      watchlist: "Watchlist",
      priceChart: "Preisdiagramm",
      strategySignal: "Strategiesignal",
      mlPrediction: "ML-Vorhersage",
      virtualPortfolio: "Virtuelles Portfolio",
      aiAnalysis: "KI-Analyse (GPT-5.2)",
      confidence: "Konfidenz",
      refreshSignal: "Signal aktualisieren",
      trainModel: "ML-Modell trainieren",
      retrainPredict: "Neu trainieren & vorhersagen",
      modelNotTrained: "Modell nicht trainiert",
      predictedChange: "Vorhergesagte Änderung",
      targetPrice: "Zielpreis",
      refreshAnalysis: "Aktualisieren",
      generatingAnalysis: "Analyse wird generiert...",
      clickRefresh: "Klicken Sie auf Aktualisieren, um KI-Analyse zu generieren"
    },
    
    // Trading
    trading: {
      title: "Trading",
      subtitle: "Führen Sie Trades aus und überwachen Sie Positionen",
      buy: "Kaufen",
      sell: "Verkaufen",
      currentPrice: "Aktueller Preis",
      quantity: "Menge",
      tradeValue: "Handelswert",
      available: "Verfügbar",
      executing: "Wird ausgeführt...",
      createPortfolioFirst: "Erstellen Sie zuerst ein Portfolio, um mit dem Trading zu beginnen",
      tradeHistory: "Handelshistorie",
      noTrades: "Keine Trades"
    },
    
    // Portfolio
    portfolio: {
      title: "Virtuelles Portfolio",
      totalValue: "Gesamtwert",
      available: "Verfügbar",
      initial: "Initial",
      openPositions: "Offene Positionen",
      createPortfolio: "Portfolio erstellen",
      creating: "Wird erstellt...",
      portfolioName: "Portfolio-Name",
      initialCapital: "Startkapital ($)",
      createToStart: "Erstellen Sie ein virtuelles Portfolio, um mit dem Trading zu beginnen"
    },
    
    // Backtest
    backtest: {
      title: "Backtesting",
      subtitle: "Testen Sie Strategien mit historischen Daten",
      configuration: "Konfiguration",
      results: "Ergebnisse",
      strategy: "Strategie",
      interval: "Intervall",
      initialCapital: "Startkapital ($)",
      positionSize: "Positionsgröße (%)",
      stopLoss: "Stop Loss (%)",
      takeProfit: "Take Profit (%)",
      optional: "Optional",
      runBacktest: "Backtest starten",
      runningSimulation: "Simulation läuft...",
      noResults: "Keine Ergebnisse",
      configureAndRun: "Konfigurieren Sie Ihre Parameter und klicken Sie auf \"Backtest starten\" für Ergebnisse.",
      equityCurve: "Kapitalkurve",
      netProfit: "Nettogewinn",
      winRate: "Gewinnrate",
      maxDrawdown: "Max. Drawdown",
      sharpeRatio: "Sharpe Ratio",
      sortinoRatio: "Sortino Ratio",
      profitFactor: "Gewinnfaktor",
      tradeSummary: "Handelsübersicht",
      totalTrades: "Gesamte Trades",
      finalEquity: "Endkapital",
      avgWin: "Durchschn. Gewinn",
      avgLoss: "Durchschn. Verlust",
      tradeLog: "Handelsprotokoll"
    },
    
    // Settings
    settings: {
      title: "Einstellungen",
      subtitle: "Konfigurieren Sie Indikatoren, Strategien, Risikomanagement und KI-Einstellungen",
      configuration: "Konfiguration",
      indicators: "Indikatoren",
      strategy: "Strategie",
      risk: "Risiko",
      ai: "KI",
      emaSettings: "EMA-Einstellungen",
      short: "Kurz",
      long: "Lang",
      trend: "Trend",
      rsiSettings: "RSI-Einstellungen",
      period: "Periode",
      supertrendSettings: "SuperTrend-Einstellungen",
      multiplier: "Multiplikator",
      strategyWeights: "Strategiegewichte",
      emaCrossover: "EMA-Kreuzung",
      emaRsi: "EMA + RSI",
      macd: "MACD",
      supertrend: "SuperTrend",
      rsiThresholds: "RSI-Schwellenwerte",
      overbought: "Überkauft",
      oversold: "Überverkauft",
      riskManagement: "Risikomanagement",
      maxPositionSize: "Max. Positionsgröße (%)",
      maxDailyLoss: "Max. Tagesverlust (%)",
      defaultStopLoss: "Standard Stop Loss (%)",
      defaultTakeProfit: "Standard Take Profit (%)",
      aiConfiguration: "KI-Konfiguration",
      enableMl: "ML-Vorhersagen aktivieren",
      enableLlm: "LLM-Analyse aktivieren",
      confidenceThreshold: "KI-Konfidenzschwelle",
      predictionHorizon: "Vorhersagehorizont (Kerzen)",
      reset: "Zurücksetzen",
      saveSettings: "Einstellungen speichern",
      saving: "Wird gespeichert...",
      loadingSettings: "Einstellungen werden geladen...",
      quickGuide: "Kurzanleitung",
      indicatorsGuide: "Konfigurieren Sie technische Indikatoren wie EMA-Perioden, RSI-Einstellungen und SuperTrend-Parameter.",
      strategyGuide: "Passen Sie das Gewicht jeder Strategie im Gesamtsignal an. Höheres Gewicht = mehr Einfluss.",
      riskGuide: "Legen Sie Positionsgrößen, Stop-Loss und Take-Profit fest, um Ihr Risiko zu verwalten.",
      aiGuide: "Aktivieren/deaktivieren Sie ML-Vorhersagen und LLM-Analyse. Legen Sie Konfidenzschwellen für Empfehlungen fest.",
      tradingMode: "Trading-Modus",
      simulationMode: "Simulationsmodus",
      simulationDesc: "Alle Trades werden mit virtuellem Kapital ausgeführt. Kein echtes Risiko.",
      aboutSpectroBot: "Über SpectroBot",
      aboutDesc: "SpectroBot ist eine algorithmische Handelsplattform mit:",
      feature1: "Echtzeit-Marktdaten über Binance",
      feature2: "Technische Indikatoren (EMA, RSI, MACD, ATR, SuperTrend)",
      feature3: "Mehrere Handelsstrategien",
      feature4: "ML-basierte Preisvorhersage",
      feature5: "GPT-5.2 Marktanalyse",
      feature6: "Erweitertes Backtesting",
      language: "Sprache"
    },
    
    // Signals
    signals: {
      buy: "KAUFEN",
      sell: "VERKAUFEN",
      hold: "HALTEN",
      bullish: "Bullisch",
      bearish: "Bärisch",
      up: "AUFWÄRTS",
      down: "ABWÄRTS"
    },
    
    // Time intervals
    intervals: {
      "1m": "1 Minute",
      "5m": "5 Minuten",
      "15m": "15 Minuten",
      "30m": "30 Minuten",
      "1h": "1 Stunde",
      "4h": "4 Stunden",
      "1d": "1 Tag",
      "1w": "1 Woche"
    },
    
    // Strategies
    strategies: {
      composite: "Zusammengesetzt",
      ema_crossover: "EMA-Kreuzung",
      ema_rsi: "EMA + RSI",
      macd: "MACD",
      supertrend: "SuperTrend"
    },
    
    // Common
    common: {
      loading: "Wird geladen...",
      error: "Fehler",
      success: "Erfolg",
      cancel: "Abbrechen",
      confirm: "Bestätigen",
      close: "Schließen",
      dataPoints: "Datenpunkte"
    },
    
    // Version
    version: {
      title: "Version",
      buildDate: "Build-Datum",
      changelog: "Änderungsprotokoll",
      currentVersion: "Aktuelle Version"
    },
    
    // Assets
    assets: {
      title: "Vermögensverwaltung",
      subtitle: "Konfigurieren Sie Ihre Watchlist mit Krypto, Aktien, Rohstoffen und mehr",
      watchlist: "Watchlist",
      addAsset: "Vermögenswert hinzufügen",
      removeAsset: "Entfernen",
      customAsset: "Benutzerdefinierter Vermögenswert",
      availableAssets: "Verfügbare Vermögenswerte",
      assetTypes: {
        crypto: "Kryptowährungen",
        stock: "Aktien",
        commodity: "Rohstoffe",
        forex: "Forex",
        index: "Indizes"
      },
      symbol: "Symbol",
      name: "Name",
      type: "Typ",
      currency: "Währung",
      basePrice: "Basispreis",
      addToWatchlist: "Zur Watchlist hinzufügen",
      removeFromWatchlist: "Von Watchlist entfernen",
      searchAssets: "Vermögenswerte suchen...",
      noAssetsFound: "Keine Vermögenswerte gefunden",
      createCustom: "Benutzerdefinierten Vermögenswert erstellen",
      addCustomAsset: "Benutzerdefinierten Vermögenswert hinzufügen",
      customAssetDesc: "Fügen Sie jeden Vermögenswert hinzu, der nicht in der Standardliste enthalten ist",
      assetAdded: "Vermögenswert zur Watchlist hinzugefügt",
      assetRemoved: "Vermögenswert von Watchlist entfernt",
      popular: "Beliebt",
      all: "Alle"
    }
  }
};

// Language names for display
export const languageNames = {
  en: { name: "English", flag: "🇬🇧" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  de: { name: "Deutsch", flag: "🇩🇪" }
};

export default translations;
