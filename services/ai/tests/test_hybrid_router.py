import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.hybrid_router import HybridAIRouter

class MockLlamaService:
    def __init__(self, should_fail: bool = False):
        self.should_fail = should_fail
        self.llm = True
        self.model_size = "1b"

    def explain_term(self, term: str, context_sentence: str = ""):
        if self.should_fail:
            raise RuntimeError("Llama Mock Failure")
        return {"term": term, "english_definition": "Mock Local Llama Definition"}

    def generate_response(self, user_prompt: str, system_prompt: str = "", history=None):
        if self.should_fail:
            raise RuntimeError("Llama Mock Failure")
        return "Mock Local Llama Response"

    def parse_grammar_with_nltk(self, sentence: str, nltk_data: dict):
        if self.should_fail:
            raise RuntimeError("Llama Mock Failure")
        return {"original_sentence": sentence, "subject": "Mock Subject"}

    def generate_flashcard(self, term: str, context_sentence: str = "", definition: str = ""):
        if self.should_fail:
            raise RuntimeError("Llama Mock Failure")
        return {"deck_name": "English Learner", "front": term}

    def extract_key_terms(self, text: str):
        if self.should_fail:
            raise RuntimeError("Llama Mock Failure")
        return {"terms": [{"term": "mock"}]}

    def summarize_and_paraphrase(self, text: str):
        if self.should_fail:
            raise RuntimeError("Llama Mock Failure")
        return {"summary_bullets": ["mock summary"]}

class TestHybridAIRouter(unittest.TestCase):
    def test_router_default_local_mode(self):
        mock_llama = MockLlamaService(should_fail=False)
        router = HybridAIRouter(llama_service=mock_llama)
        
        res = router.explain_term("overfitting", "In machine learning, overfitting occurs when a model learns noise.")
        self.assertEqual(res["provider"], "local_llama")
        self.assertFalse(res["is_fallback"])
        self.assertEqual(res["task_type"], "local")

    def test_router_heavy_task_detection(self):
        mock_llama = MockLlamaService(should_fail=False)
        router = HybridAIRouter(llama_service=mock_llama)
        
        long_text = "Machine learning " * 120  # ~2000 chars
        self.assertTrue(router.is_heavy_task(long_text, threshold=1500))
        self.assertFalse(router.is_heavy_task("Short sentence.", threshold=1500))

    def test_router_fast_mode_request(self):
        mock_llama = MockLlamaService(should_fail=False)
        router = HybridAIRouter(llama_service=mock_llama)
        
        res = router.explain_term("algorithm", fast=True)
        self.assertEqual(res["provider"], "nltk_fast")
        self.assertTrue(res["is_fast"])

    def test_router_fallback_when_local_fails(self):
        failing_llama = MockLlamaService(should_fail=True)
        router = HybridAIRouter(llama_service=failing_llama)
        
        res = router.explain_term("regularization", "Regularization prevents overfitting.")
        self.assertIn(res["provider"], ["gemini_cloud", "nltk_fast"])
        self.assertTrue(res["is_fallback"])

    def test_router_status(self):
        mock_llama = MockLlamaService(should_fail=False)
        router = HybridAIRouter(llama_service=mock_llama)
        
        status = router.get_router_status()
        self.assertEqual(status["default_engine"], "local_llama")
        self.assertTrue(status["local_llama_available"])

if __name__ == "__main__":
    unittest.main()
