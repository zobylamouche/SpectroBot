"""
LLM Analysis Service for SpectroBot
Uses OpenAI API for advanced market analysis
Supports multiple languages: English, French, Spanish, German
"""
import os
import logging
from typing import Dict, List, Optional
from dotenv import load_dotenv
import httpx
from openai import AsyncOpenAI

load_dotenv()
logger = logging.getLogger(__name__)

OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://ollama:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")
OLLAMA_TIMEOUT_SECONDS = float(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "180"))
ENABLE_OLLAMA_FALLBACK = os.environ.get("ENABLE_OLLAMA_FALLBACK", "true").lower() == "true"

# Language-specific system messages
SYSTEM_MESSAGES = {
    "English": "You are SpectroBot AI, a professional cryptocurrency trading analyst. Provide concise, data-driven analysis without disclaimers about financial advice. Respond in English.",
    "French": "Vous êtes SpectroBot AI, un analyste professionnel de trading de cryptomonnaies. Fournissez une analyse concise et basée sur les données, sans avertissements sur les conseils financiers. Répondez en français.",
    "Spanish": "Eres SpectroBot AI, un analista profesional de trading de criptomonedas. Proporciona análisis concisos basados en datos, sin descargos de responsabilidad sobre consejos financieros. Responde en español.",
    "German": "Sie sind SpectroBot AI, ein professioneller Kryptowährungs-Trading-Analyst. Geben Sie prägnante, datengestützte Analysen ohne Haftungsausschlüsse bezüglich Finanzberatung. Antworten Sie auf Deutsch."
}

# Language-specific prompts
def get_analysis_prompt(language: str, symbol: str, current_price: float, price_change_24h: float, 
                        rsi_value, macd_hist, supertrend_dir, ml_prediction: Dict, strategy_signal: Dict) -> str:
    
    if language == "French":
        return f"""Analysez les données de trading crypto suivantes et fournissez une recommandation actionnable :

**Symbole:** {symbol}
**Prix actuel:** ${current_price:,.2f}
**Variation 24h:** {price_change_24h:+.2f}%

**Indicateurs Techniques:**
- RSI (14): {rsi_value if rsi_value else 'N/A'}
- Histogramme MACD: {macd_hist if macd_hist else 'N/A'}
- Direction SuperTrend: {'Haussier' if supertrend_dir == 1 else 'Baissier' if supertrend_dir == -1 else 'N/A'}

**Prédiction ML:**
- Direction: {ml_prediction.get('direction', 'N/A')}
- Confiance: {ml_prediction.get('direction_probability', 0) * 100:.1f}%
- Variation de prix prédite: {ml_prediction.get('predicted_price_change_pct', 0):.2f}%

**Signal de Stratégie:**
- Signal: {strategy_signal.get('signal', 'N/A')}
- Confiance: {strategy_signal.get('confidence', 0) * 100:.1f}%

Fournissez:
1. Sentiment du marché (1 phrase)
2. Facteurs de risque clés (1-2 points)
3. Recommandation de trading (ACHAT/VENTE/ATTENTE) avec raisonnement bref
4. Niveaux suggérés de stop-loss et take-profit (% du prix actuel)

Restez concis et professionnel."""

    elif language == "Spanish":
        return f"""Analice los siguientes datos de trading de cripto y proporcione una recomendación accionable:

**Símbolo:** {symbol}
**Precio actual:** ${current_price:,.2f}
**Cambio 24h:** {price_change_24h:+.2f}%

**Indicadores Técnicos:**
- RSI (14): {rsi_value if rsi_value else 'N/A'}
- Histograma MACD: {macd_hist if macd_hist else 'N/A'}
- Dirección SuperTrend: {'Alcista' if supertrend_dir == 1 else 'Bajista' if supertrend_dir == -1 else 'N/A'}

**Predicción ML:**
- Dirección: {ml_prediction.get('direction', 'N/A')}
- Confianza: {ml_prediction.get('direction_probability', 0) * 100:.1f}%
- Cambio de precio predicho: {ml_prediction.get('predicted_price_change_pct', 0):.2f}%

**Señal de Estrategia:**
- Señal: {strategy_signal.get('signal', 'N/A')}
- Confianza: {strategy_signal.get('confidence', 0) * 100:.1f}%

Proporcione:
1. Sentimiento del mercado (1 frase)
2. Factores de riesgo clave (1-2 puntos)
3. Recomendación de trading (COMPRA/VENTA/ESPERAR) con razonamiento breve
4. Niveles sugeridos de stop-loss y take-profit (% del precio actual)

Sea conciso y profesional."""

    elif language == "German":
        return f"""Analysieren Sie die folgenden Krypto-Trading-Daten und geben Sie eine umsetzbare Empfehlung:

**Symbol:** {symbol}
**Aktueller Preis:** ${current_price:,.2f}
**24h-Änderung:** {price_change_24h:+.2f}%

**Technische Indikatoren:**
- RSI (14): {rsi_value if rsi_value else 'N/A'}
- MACD-Histogramm: {macd_hist if macd_hist else 'N/A'}
- SuperTrend-Richtung: {'Bullisch' if supertrend_dir == 1 else 'Bärisch' if supertrend_dir == -1 else 'N/A'}

**ML-Vorhersage:**
- Richtung: {ml_prediction.get('direction', 'N/A')}
- Konfidenz: {ml_prediction.get('direction_probability', 0) * 100:.1f}%
- Vorhergesagte Preisänderung: {ml_prediction.get('predicted_price_change_pct', 0):.2f}%

**Strategiesignal:**
- Signal: {strategy_signal.get('signal', 'N/A')}
- Konfidenz: {strategy_signal.get('confidence', 0) * 100:.1f}%

Liefern Sie:
1. Marktstimmung (1 Satz)
2. Wichtige Risikofaktoren (1-2 Punkte)
3. Trading-Empfehlung (KAUFEN/VERKAUFEN/HALTEN) mit kurzer Begründung
4. Vorgeschlagene Stop-Loss- und Take-Profit-Levels (% vom aktuellen Preis)

Bleiben Sie prägnant und professionell."""

    else:  # English (default)
        return f"""Analyze the following cryptocurrency trading data and provide a brief, actionable trading recommendation:

**Symbol:** {symbol}
**Current Price:** ${current_price:,.2f}
**24h Change:** {price_change_24h:+.2f}%

**Technical Indicators:**
- RSI (14): {rsi_value if rsi_value else 'N/A'}
- MACD Histogram: {macd_hist if macd_hist else 'N/A'}
- SuperTrend Direction: {'Bullish' if supertrend_dir == 1 else 'Bearish' if supertrend_dir == -1 else 'N/A'}

**ML Prediction:**
- Direction: {ml_prediction.get('direction', 'N/A')}
- Confidence: {ml_prediction.get('direction_probability', 0) * 100:.1f}%
- Predicted Price Change: {ml_prediction.get('predicted_price_change_pct', 0):.2f}%

**Strategy Signal:**
- Signal: {strategy_signal.get('signal', 'N/A')}
- Confidence: {strategy_signal.get('confidence', 0) * 100:.1f}%

Provide:
1. Market sentiment (1 sentence)
2. Key risk factors (1-2 points)
3. Trading recommendation (BUY/SELL/HOLD) with brief reasoning
4. Suggested stop-loss and take-profit levels (% from current price)

Keep the response concise and professional."""


async def _query_openai(system_message: str, user_prompt: str) -> Dict:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    try:
        client = AsyncOpenAI(api_key=api_key)
        completion = await client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt},
            ],
        )
        response = (completion.choices[0].message.content or "").strip()
        if not response:
            return {"success": False, "error": "Empty OpenAI response"}
        return {"success": True, "content": response, "provider": "openai", "model": OPENAI_MODEL}
    except Exception as e:
        logger.error(f"OpenAI error: {str(e)}")
        return {"success": False, "error": str(e)}


async def _query_ollama(system_message: str, user_prompt: str) -> Dict:
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(OLLAMA_TIMEOUT_SECONDS)) as client:
            # Try modern chat endpoint first.
            chat_response = await client.post(
                f"{OLLAMA_BASE_URL.rstrip('/')}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": user_prompt},
                    ],
                    "stream": False,
                },
            )
            if chat_response.status_code < 400:
                data = chat_response.json()
                content = (data.get("message") or {}).get("content", "").strip()
                if content:
                    return {"success": True, "content": content, "provider": "ollama", "model": OLLAMA_MODEL}

            # Compatibility fallback for older Ollama APIs.
            generate_response = await client.post(
                f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": f"System: {system_message}\n\nUser: {user_prompt}",
                    "stream": False,
                },
            )
            generate_response.raise_for_status()
            gen_data = generate_response.json()
            content = (gen_data.get("response") or "").strip()
            if not content:
                return {"success": False, "error": "Empty Ollama response"}
            return {"success": True, "content": content, "provider": "ollama", "model": OLLAMA_MODEL}
    except Exception as e:
        err = (str(e) or repr(e) or "unknown ollama error").strip()
        logger.error(f"Ollama error: {err}")
        return {"success": False, "error": f"Ollama request failed: {err}"}


async def _query_hybrid(system_message: str, user_prompt: str) -> Dict:
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        openai_result = await _query_openai(system_message, user_prompt)
        if openai_result.get("success"):
            return openai_result
        if not ENABLE_OLLAMA_FALLBACK:
            return openai_result

    if not ENABLE_OLLAMA_FALLBACK:
        return {"success": False, "error": "No LLM provider available"}

    return await _query_ollama(system_message, user_prompt)


async def analyze_market_with_llm(
    symbol: str,
    current_price: float,
    price_change_24h: float,
    indicators: Dict,
    ml_prediction: Dict,
    strategy_signal: Dict,
    language: str = "English",
    session_id: str = "spectrobot-analysis"
) -> Dict:
    """
    Use LLM to provide advanced market analysis and trading recommendations
    Supports multiple languages: English, French, Spanish, German
    """
    try:
        # Build analysis prompt
        rsi_value = indicators.get("rsi", [None])[-1] if indicators.get("rsi") else None
        macd_hist = indicators.get("macd", {}).get("histogram", [None])[-1] if indicators.get("macd") else None
        supertrend_dir = indicators.get("supertrend", {}).get("direction", [None])[-1] if indicators.get("supertrend") else None
        
        # Get language-specific prompt
        analysis_prompt = get_analysis_prompt(
            language, symbol, current_price, price_change_24h,
            rsi_value, macd_hist, supertrend_dir, ml_prediction, strategy_signal
        )
        
        # Get language-specific system message
        system_message = SYSTEM_MESSAGES.get(language, SYSTEM_MESSAGES["English"])

        llm_result = await _query_hybrid(system_message, analysis_prompt)
        if not llm_result.get("success"):
            return llm_result
        response = llm_result.get("content", "")
        
        return {
            "success": True,
            "analysis": response,
            "symbol": symbol,
            "language": language,
            "provider": llm_result.get("provider"),
            "model": llm_result.get("model"),
            "timestamp": None  # Will be set by caller
        }
        
    except Exception as e:
        logger.error(f"LLM analysis error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


async def explain_trading_decision(
    symbol: str,
    signal: str,
    confidence: float,
    indicators_summary: str,
    language: str = "English",
    session_id: str = "spectrobot-explain"
) -> Dict:
    """
    Use LLM to explain why a particular trading decision was made
    Supports multiple languages
    """
    try:
        # Language-specific explain prompts
        if language == "French":
            explain_prompt = f"""Expliquez ce signal de trading pour {symbol} en termes simples:

Signal: {signal}
Confiance: {confidence * 100:.1f}%

Résumé des indicateurs:
{indicators_summary}

Fournissez une explication de 2-3 phrases qu'un trader particulier comprendrait."""
        elif language == "Spanish":
            explain_prompt = f"""Explique esta señal de trading para {symbol} en términos simples:

Señal: {signal}
Confianza: {confidence * 100:.1f}%

Resumen de indicadores:
{indicators_summary}

Proporcione una explicación de 2-3 frases que un trader minorista entendería."""
        elif language == "German":
            explain_prompt = f"""Erklären Sie dieses Trading-Signal für {symbol} in einfachen Worten:

Signal: {signal}
Konfidenz: {confidence * 100:.1f}%

Indikator-Zusammenfassung:
{indicators_summary}

Geben Sie eine 2-3 Satz Erklärung, die ein Privatanleger verstehen würde."""
        else:
            explain_prompt = f"""Explain this trading signal for {symbol} in simple terms:

Signal: {signal}
Confidence: {confidence * 100:.1f}%

Indicator Summary:
{indicators_summary}

Provide a 2-3 sentence explanation that a retail trader would understand."""

        system_message = SYSTEM_MESSAGES.get(language, SYSTEM_MESSAGES["English"])

        llm_result = await _query_hybrid(system_message, explain_prompt)
        if not llm_result.get("success"):
            return llm_result
        response = llm_result.get("content", "")
        
        return {
            "success": True,
            "explanation": response,
            "language": language,
            "provider": llm_result.get("provider"),
            "model": llm_result.get("model")
        }
        
    except Exception as e:
        logger.error(f"LLM explain error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
