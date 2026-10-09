import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.gemini import GeminiService

class TestGeminiService(unittest.TestCase):
    def test_unconfigured_api_key(self):
        service = GeminiService(api_key="")
        self.assertFalse(service.is_configured())

        with self.assertRaises(ValueError):
            service.generate_response("Hello")

    def test_configured_api_key_check(self):
        service = GeminiService(api_key="AIzaSyTestApiKey123456789")
        self.assertTrue(service.is_configured())

    def test_clean_json_output_formatting(self):
        service = GeminiService(api_key="mock")

        raw_json_with_codeblock = "```json\n{\n  \"term\": \"overfitting\",\n  \"part_of_speech\": \"noun\"\n}\n```"
        parsed = service.clean_json_output(raw_json_with_codeblock)
        self.assertEqual(parsed.get("term"), "overfitting")
        self.assertEqual(parsed.get("part_of_speech"), "noun")

        raw_json_with_trailing_commas = '{"items": ["a", "b",], "status": "ok",}'
        parsed_clean = service.clean_json_output(raw_json_with_trailing_commas)
        self.assertEqual(parsed_clean.get("status"), "ok")

if __name__ == "__main__":
    unittest.main()
