import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.nltk_parser import NLTKGrammarParser

class TestNLTKGrammarParser(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parser = NLTKGrammarParser()

    def test_simple_sentence_parsing(self):
        sentence = "The student reads a complex academic book."
        res = self.parser.parse_sentence(sentence)

        self.assertEqual(res["sentence"], sentence)
        self.assertIn("tokens", res)
        self.assertIn("pos_tags", res)
        self.assertGreater(len(res["tokens"]), 0)
        
        svo = res.get("svo_candidates", {})
        self.assertTrue(len(svo.get("subject", "")) > 0)
        self.assertTrue(len(svo.get("verb", "")) > 0)

    def test_noun_and_verb_phrases(self):
        sentence = "Artificial intelligence models perform rapid natural language processing."
        res = self.parser.parse_sentence(sentence)

        self.assertIn("noun_phrases", res)
        self.assertIn("verb_phrases", res)
        self.assertGreaterEqual(len(res["noun_phrases"]), 1)

    def test_pos_tagging_and_phrases(self):
        sentence = "She studied deep learning in the laboratory."
        res = self.parser.parse_sentence(sentence)

        self.assertIn("pos_tags", res)
        tags = [item["tag"] for item in res["pos_tags"]]
        self.assertIn("IN", tags)  # IN is preposition tag in Penn Treebank

    def test_empty_and_short_sentence(self):
        res = self.parser.parse_sentence("Algorithms run.")
        self.assertEqual(res["sentence"], "Algorithms run.")
        self.assertIn("tree_structure", res)

if __name__ == "__main__":
    unittest.main()
