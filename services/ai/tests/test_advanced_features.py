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
            raise RuntimeError("Llama failure")
        return {"term": term, "english_definition": "Mock Definition"}

    def generate_response(self, user_prompt: str, system_prompt: str = "", history=None):
        if self.should_fail:
            raise RuntimeError("Llama failure")
        return "Mock Response"

    def parse_grammar_with_nltk(self, sentence: str, nltk_data: dict):
        if self.should_fail:
            raise RuntimeError("Llama failure")
        return {"original_sentence": sentence, "subject": "Mock Subject"}

    def generate_flashcard(self, term: str, context_sentence: str = "", definition: str = ""):
        if self.should_fail:
            raise RuntimeError("Llama failure")
        return {"deck_name": "English Learner", "front": term}

    def extract_key_terms(self, text: str):
        if self.should_fail:
            raise RuntimeError("Llama failure")
        return {"terms": [{"term": "machine learning"}]}

    def summarize_and_paraphrase(self, text: str):
        if self.should_fail:
            raise RuntimeError("Llama failure")
        return {"summary_bullets": ["Key bullet point"]}

class TestAdvancedAIRouting(unittest.TestCase):
    def setUp(self):
        self.router = HybridAIRouter(llama_service=MockLlamaService(should_fail=False))

    def test_extract_key_terms_routing(self):
        res = self.router.extract_key_terms("Deep neural networks learn representations.", mode="local")
        self.assertEqual(res["provider"], "local_llama")
        self.assertEqual(res["task_type"], "local")

        res_fast = self.router.extract_key_terms("Deep neural networks learn representations.", mode="fast")
        self.assertEqual(res_fast["provider"], "nltk_fast")

    def test_summarize_and_paraphrase_routing(self):
        res = self.router.summarize_and_paraphrase("Natural language processing is a subfield of AI.", mode="local")
        self.assertEqual(res["provider"], "local_llama")
        self.assertIn("summary_bullets", res)

    def test_generate_flashcard_routing(self):
        res = self.router.generate_flashcard("overfitting", "Model fits noise.", mode="local")
        self.assertEqual(res["provider"], "local_llama")
        self.assertEqual(res["front"], "overfitting")

    def test_grammar_parse_routing(self):
        res = self.router.parse_grammar("The model optimizes parameters.", mode="local")
        self.assertEqual(res["provider"], "local_llama")
        self.assertEqual(res["subject"], "Mock Subject")

    def test_chat_routing(self):
        res = self.router.chat("What is transfer learning?", mode="local")
        self.assertEqual(res["provider"], "local_llama")
        self.assertEqual(res["response"], "Mock Response")

if __name__ == "__main__":
    unittest.main()
