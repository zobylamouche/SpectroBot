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
OLLAMA_TIMEOUT_SECONDS = float(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "360"))
OLLAMA_NUM_PREDICT = int(os.environ.get("OLLAMA_NUM_PREDICT", "250"))
ENABLE_OLLAMA_FALLBACK = os.environ.get("ENABLE_OLLAMA_FALLBACK", "true").lower() == "true"

# Language-specific system messages
SYSTEM_MESSAGES = {
    "English": "Crypto trading analyst. Be very brief. No disclaimers.",
    "French": "Analyste crypto. Soyez très bref. Pas d'avertissements.",
    "Spanish": "Analista crypto. Sé muy breve. Sin advertencias.",
    "German": "Krypto-Analyst. Sehr kurz antworten. Keine Haftungshinweise.",
}

# Language-specific prompts

def get_analysis_prompt(language, symbol, current_price, price_change_24h,
                        rsi_value, macd_hist, supertrend_dir, ml_prediction, strategy_signal):
    rsi_str = f"{rsi_value:.0f}" if rsi_value is not None else "N/A"
    macd_str = "+" if macd_hist and macd_hist > 0 else ("-" if macd_hist is not None else "N/A")
    st_raw = {1: "haussier", -1: "baissier"}.get(supertrend_dir, "?")
    sig = strategy_signal.get("signal", "?")
    conf = strategy_signal.get("confidence", 0) * 100

    if language == "French":
        st_str = st_raw
        return (
            f"{symbol} ${current_price:,.2f} ({price_change_24h:+.2f}%) | "
            f"RSI:{rsi_str} MACD:{macd_str} ST:{st_str} | Signal:{sig} {conf:.0f}%\n"
            f"En 3 points tres brefs: 1)ACHAT/VENTE/ATTENTE + raison 2)Risque 3)Stop-loss% et TP%"
        )
    if language == "Spanish":
        st_str = {"haussier": "alza", "baissier": "baja"}.get(st_raw, st_raw)
        return (
            f"{symbol} ${current_price:,.2f} ({price_change_24h:+.2f}%) | "
            f"RSI:{rsi_str} MACD:{macd_str} ST:{st_str} | Signal:{sig} {conf:.0f}%\n"
            f"3 puntos breves: 1)COMPRA/VENTA/ESPERAR + razon 2)Riesgo 3)Stop-loss% y TP%"
        )
    if language == "German":
        st_str = {"haussier": "bullisch", "baissier": "baerisch"}.get(st_raw, st_raw)
        return (
            f"{symbol} ${current_price:,.2f} ({price_change_24h:+.2f}%) | "
            f"RSI:{rsi_str} MACD:{macd_str} ST:{st_str} | Signal:{sig} {conf:.0f}%\n"
            f"3 kurze Punkte: 1)KAUFEN/VERKAUFEN/HALTEN + Grund 2)Risiko 3)Stop-Loss% und TP%"
        )
    # English default
    st_str = {"haussier": "bullish", "baissier": "bearish"}.get(st_raw, st_raw)
    return (
        f"{symbol} ${current_price:,.2f} ({price_change_24h:+.2f}%) | "
        f"RSI:{rsi_str} MACD:{macd_str} ST:{st_str} | Signal:{sig} {conf:.0f}%\n"
        f"3 brief points: 1)BUY/SELL/HOLD + reason 2)Main risk 3)Stop-loss% and TP%"
    )

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
                    "keep_alive": -1,
                    "options": {"num_predict": OLLAMA_NUM_PREDICT},
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
                    "keep_alive": -1,
                    "options": {"num_predict": OLLAMA_NUM_PREDICT},
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
