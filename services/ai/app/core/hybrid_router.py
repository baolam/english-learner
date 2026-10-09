import os
from typing import Dict, Any, List, Optional
from app.core.llama import LlamaService
from app.core.gemini import GeminiService
from app.core.fast_algorithms import FastAIProcessor
from app.core.nltk_parser import NLTKGrammarParser

class HybridAIRouter:
    """
    Hybrid AI Manager & Offline Fallback Router.
    - Default Mode: LOCAL (Offline Llama 3.2 1B/3B GGUF)
    - Fast Mode: FAST (NLTK Heuristics)
    - Heavy/Cloud Mode: API (Google Gemini 1.5 Flash API)
    
    Automatic Routing Rules:
    1. Fast mode requested -> FAST engine.
    2. Heavy task detected (e.g. text > 1500 chars, complex summarization) OR explicit mode="api" / heavy=True -> API engine if available.
    3. Default -> LOCAL engine.
    4. Auto Fallback: LOCAL fails -> API -> FAST; or API fails -> LOCAL -> FAST.
    """
    def __init__(self, llama_service: Optional[LlamaService] = None, nltk_parser: Optional[NLTKGrammarParser] = None):
        self.nltk_parser = nltk_parser or NLTKGrammarParser()
        self.fast_processor = FastAIProcessor(self.nltk_parser)
        
        self.llama_service = llama_service
        if self.llama_service is None:
            try:
                print("[HybridAIRouter] Initializing Local Llama Service...")
                self.llama_service = LlamaService()
            except Exception as e:
                print(f"[HybridAIRouter WARNING] Failed to initialize Local Llama Service: {e}")
                self.llama_service = None

        self.gemini_service = GeminiService()
        
    def is_heavy_task(self, text: str, threshold: int = 1500) -> bool:
        """Determines if a task is heavy based on text volume and complexity."""
        if not text:
            return False
        return len(text) >= threshold

    def get_router_status(self) -> Dict[str, Any]:
        return {
            "default_engine": "local_llama",
            "local_llama_available": self.llama_service is not None and getattr(self.llama_service, "llm", None) is not None,
            "gemini_api_configured": self.gemini_service.is_configured(),
            "fast_processor_available": True,
            "current_local_model": self.llama_service.model_size if self.llama_service else None
        }

    # -------------------------------------------------------------
    # Chat & Stream Router
    # -------------------------------------------------------------
    def chat(self, prompt: str, history: Optional[List[Dict[str, Any]]] = None, mode: str = "auto", heavy: bool = False) -> Dict[str, Any]:
        use_heavy = heavy or self.is_heavy_task(prompt) or mode == "api"

        # 1. Try Heavy / API Mode if requested or heavy
        if use_heavy and self.gemini_service.is_configured():
            try:
                res = self.gemini_service.generate_response(prompt, history=history)
                return {"response": res, "provider": "gemini_cloud", "is_fallback": False, "task_type": "heavy"}
            except Exception as e:
                print(f"[HybridAIRouter] Gemini API chat failed: {e}. Falling back to Local Llama...")

        # 2. Try Default Local Llama Mode
        if mode != "fast" and self.llama_service and self.llama_service.llm:
            try:
                res = self.llama_service.generate_response(prompt, history=history)
                return {"response": res, "provider": "local_llama", "is_fallback": use_heavy, "task_type": "local"}
            except Exception as e:
                print(f"[HybridAIRouter] Local Llama chat failed: {e}. Falling back to Gemini API / Fast...")

        # 3. Try Gemini API fallback if Local failed
        if self.gemini_service.is_configured():
            try:
                res = self.gemini_service.generate_response(prompt, history=history)
                return {"response": res, "provider": "gemini_cloud", "is_fallback": True, "task_type": "fallback"}
            except Exception as e:
                print(f"[HybridAIRouter] Gemini fallback failed: {e}")

        # 4. Ultimate Fallback response
        return {
            "response": f"I processed your query: '{prompt}'. (Local AI and Cloud API are currently unavailable)",
            "provider": "nltk_fast",
            "is_fallback": True,
            "task_type": "fast"
        }

    # -------------------------------------------------------------
    # Structured Feature Routers (Term Explain, Grammar, Flashcards, etc.)
    # -------------------------------------------------------------
    def explain_term(self, term: str, context_sentence: str = "", mode: str = "auto", fast: bool = False, heavy: bool = False) -> Dict[str, Any]:
        if fast or mode == "fast":
            res = self.fast_processor.fast_explain_term(term, context_sentence)
            res.update({"provider": "nltk_fast", "is_fallback": False})
            return res

        use_heavy = heavy or self.is_heavy_task(context_sentence, 1200) or mode == "api"

        # Try API if heavy
        if use_heavy and self.gemini_service.is_configured():
            try:
                res = self.gemini_service.explain_term(term, context_sentence)
                res.update({"provider": "gemini_cloud", "is_fallback": False, "task_type": "heavy"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Gemini explain_term failed: {e}")

        # Primary: Local Llama
        if self.llama_service and self.llama_service.llm:
            try:
                res = self.llama_service.explain_term(term, context_sentence)
                res.update({"provider": "local_llama", "is_fallback": False, "task_type": "local"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Local Llama explain_term failed: {e}")

        # Fallback 1: Gemini API
        if self.gemini_service.is_configured():
            try:
                res = self.gemini_service.explain_term(term, context_sentence)
                res.update({"provider": "gemini_cloud", "is_fallback": True, "task_type": "fallback"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Gemini fallback explain_term failed: {e}")

        # Fallback 2: Fast Heuristics
        res = self.fast_processor.fast_explain_term(term, context_sentence)
        res.update({"provider": "nltk_fast", "is_fallback": True})
        return res

    def parse_grammar(self, sentence: str, mode: str = "auto", fast: bool = False, heavy: bool = False) -> Dict[str, Any]:
        if fast or mode == "fast":
            res = self.fast_processor.fast_grammar_parse(sentence)
            res.update({"provider": "nltk_fast", "is_fallback": False})
            return res

        nltk_data = self.nltk_parser.parse_sentence(sentence)
        use_heavy = heavy or self.is_heavy_task(sentence, 1000) or mode == "api"

        # Try API if heavy
        if use_heavy and self.gemini_service.is_configured():
            try:
                res = self.gemini_service.parse_grammar(sentence, nltk_data)
                res.update({"provider": "gemini_cloud", "is_fallback": False, "task_type": "heavy"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Gemini parse_grammar failed: {e}")

        # Primary: Local Llama
        if self.llama_service and self.llama_service.llm:
            try:
                res = self.llama_service.parse_grammar_with_nltk(sentence, nltk_data)
                res.update({"provider": "local_llama", "is_fallback": False, "task_type": "local"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Local Llama parse_grammar failed: {e}")

        # Fallback 1: Gemini API
        if self.gemini_service.is_configured():
            try:
                res = self.gemini_service.parse_grammar(sentence, nltk_data)
                res.update({"provider": "gemini_cloud", "is_fallback": True, "task_type": "fallback"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Gemini fallback parse_grammar failed: {e}")

        # Fallback 2: Fast Heuristics
        res = self.fast_processor.fast_grammar_parse(sentence)
        res.update({"provider": "nltk_fast", "is_fallback": True})
        return res

    def generate_flashcard(self, term: str, context_sentence: str = "", definition: str = "", mode: str = "auto", fast: bool = False) -> Dict[str, Any]:
        if fast or mode == "fast":
            res = self.fast_processor.fast_generate_flashcard(term, context_sentence, definition)
            res.update({"provider": "nltk_fast", "is_fallback": False})
            return res

        # Primary: Local Llama
        if self.llama_service and self.llama_service.llm:
            try:
                res = self.llama_service.generate_flashcard(term, context_sentence, definition)
                res.update({"provider": "local_llama", "is_fallback": False, "task_type": "local"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Local Llama flashcard failed: {e}")

        # Fallback 1: Gemini API
        if self.gemini_service.is_configured():
            try:
                res = self.gemini_service.generate_flashcard(term, context_sentence, definition)
                res.update({"provider": "gemini_cloud", "is_fallback": True, "task_type": "fallback"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Gemini flashcard failed: {e}")

        # Fallback 2: Fast Heuristics
        res = self.fast_processor.fast_generate_flashcard(term, context_sentence, definition)
        res.update({"provider": "nltk_fast", "is_fallback": True})
        return res

    def extract_key_terms(self, text: str, mode: str = "auto", fast: bool = False, heavy: bool = False) -> Dict[str, Any]:
        if fast or mode == "fast":
            res = self.fast_processor.fast_extract_terms(text)
            res.update({"provider": "nltk_fast", "is_fallback": False})
            return res

        use_heavy = heavy or self.is_heavy_task(text, 1500) or mode == "api"

        if use_heavy and self.gemini_service.is_configured():
            try:
                res = self.gemini_service.extract_key_terms(text)
                res.update({"provider": "gemini_cloud", "is_fallback": False, "task_type": "heavy"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Gemini extract_key_terms failed: {e}")

        if self.llama_service and self.llama_service.llm:
            try:
                res = self.llama_service.extract_key_terms(text)
                res.update({"provider": "local_llama", "is_fallback": False, "task_type": "local"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Local Llama extract_key_terms failed: {e}")

        if self.gemini_service.is_configured():
            try:
                res = self.gemini_service.extract_key_terms(text)
                res.update({"provider": "gemini_cloud", "is_fallback": True, "task_type": "fallback"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Gemini fallback extract_key_terms failed: {e}")

        res = self.fast_processor.fast_extract_terms(text)
        res.update({"provider": "nltk_fast", "is_fallback": True})
        return res

    def summarize_and_paraphrase(self, text: str, mode: str = "auto", fast: bool = False, heavy: bool = False) -> Dict[str, Any]:
        if fast or mode == "fast":
            res = self.fast_processor.fast_summarize_paraphrase(text)
            res.update({"provider": "nltk_fast", "is_fallback": False})
            return res

        use_heavy = heavy or self.is_heavy_task(text, 1200) or mode == "api"

        if use_heavy and self.gemini_service.is_configured():
            try:
                res = self.gemini_service.summarize_and_paraphrase(text)
                res.update({"provider": "gemini_cloud", "is_fallback": False, "task_type": "heavy"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Gemini summarize failed: {e}")

        if self.llama_service and self.llama_service.llm:
            try:
                res = self.llama_service.summarize_and_paraphrase(text)
                res.update({"provider": "local_llama", "is_fallback": False, "task_type": "local"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Local Llama summarize failed: {e}")

        if self.gemini_service.is_configured():
            try:
                res = self.gemini_service.summarize_and_paraphrase(text)
                res.update({"provider": "gemini_cloud", "is_fallback": True, "task_type": "fallback"})
                return res
            except Exception as e:
                print(f"[HybridAIRouter] Gemini fallback summarize failed: {e}")

        res = self.fast_processor.fast_summarize_paraphrase(text)
        res.update({"provider": "nltk_fast", "is_fallback": True})
        return res
