import os
import sys
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

class TestAIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "service": "ai-service"})

    def test_model_info_endpoint(self):
        response = self.client.get("/api/ai/model-info")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("default_engine", data)

    def test_fast_term_explain_endpoint(self):
        payload = {
            "term": "overfitting",
            "context_sentence": "Overfitting happens when a machine learning model fits training data too closely.",
            "fast": True
        }
        response = self.client.post("/api/ai/term-explain", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["term"], "overfitting")
        self.assertEqual(data["provider"], "nltk_fast")

    def test_fast_grammar_parse_endpoint(self):
        payload = {
            "sentence": "The neural network processed the images accurately.",
            "fast": True
        }
        response = self.client.post("/api/ai/grammar-parse", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("simplified_sentence", data)
        self.assertEqual(data["provider"], "nltk_fast")

    def test_fast_flashcard_generate_endpoint(self):
        payload = {
            "term": "gradient descent",
            "context_sentence": "We optimized the model parameters using gradient descent.",
            "definition": "An optimization algorithm used to minimize cost functions.",
            "fast": True
        }
        response = self.client.post("/api/ai/flashcard-generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["deck_name"], "English Learner")
        self.assertIn("front", data)

    def test_fast_extract_terms_endpoint(self):
        payload = {
            "text": "Deep neural networks are composed of multiple layers to learn hierarchical representations.",
            "fast": True
        }
        response = self.client.post("/api/ai/extract-terms", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("terms", data)

    def test_fast_summarize_endpoint(self):
        payload = {
            "text": "Natural language processing enables computers to understand human language. It is widely used in translation and sentiment analysis.",
            "fast": True
        }
        response = self.client.post("/api/ai/summarize-paraphrase", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("summary_bullets", data)

if __name__ == "__main__":
    unittest.main()
