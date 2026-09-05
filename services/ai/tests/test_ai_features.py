import sys
import io
import json
import os

# Set path so tests can run directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)

from app.core.nltk_parser import NLTKGrammarParser
from app.core.llama import LlamaService

def test_all_ai_features():
    print("=== 1. Testing NLTK Grammar Parser ===")
    parser = NLTKGrammarParser()
    sample_sentence = "The researchers achieved a major breakthrough in artificial intelligence."
    nltk_res = parser.parse_sentence(sample_sentence)
    print("NLTK Output:")
    print(json.dumps(nltk_res, indent=2))
    assert "pos_tags" in nltk_res
    assert "svo_candidates" in nltk_res
    print("NLTK Parser: PASSED!\n")

    print("=== 2. Testing Llama Service Initialization ===")
    ai = LlamaService()

    print("=== 3. Testing Term Explanation (English Only) ===")
    term_res = ai.explain_term("overfitting", "Regularization techniques reduce overfitting in deep neural networks.")
    print("Term Explanation Output:")
    print(json.dumps(term_res, indent=2))
    assert "term" in term_res
    assert "english_definition" in term_res
    assert "vietnamese_meaning" not in term_res
    print("Term Explanation: PASSED!\n")

    print("=== 4. Testing Grammar Parsing with NLTK + Llama (English Only) ===")
    grammar_res = ai.parse_grammar_with_nltk(sample_sentence, nltk_res)
    print("Grammar Parsing Output:")
    print(json.dumps(grammar_res, indent=2))
    assert "original_sentence" in grammar_res
    assert "subject" in grammar_res
    assert "nltk_analysis" in grammar_res
    print("Grammar Parsing: PASSED!\n")

    print("=== 5. Testing Flashcard Generation (English Only) ===")
    flashcard_res = ai.generate_flashcard("overfitting", "Regularization techniques reduce overfitting in deep neural networks.", "A modeling error in machine learning.")
    print("Flashcard Output:")
    print(json.dumps(flashcard_res, indent=2))
    assert "front" in flashcard_res
    assert "back" in flashcard_res
    print("Flashcard Generation: PASSED!\n")

    print("=== 6. Testing Key Term Extraction (English Only) ===")
    text_sample = "Deep learning models require extensive computational resources and hyperparameter optimization."
    terms_res = ai.extract_key_terms(text_sample)
    print("Key Terms Output:")
    print(json.dumps(terms_res, indent=2))
    assert "terms" in terms_res
    print("Key Term Extraction: PASSED!\n")

    print("=== 7. Testing Summarization & Paraphrasing (English Only) ===")
    summary_res = ai.summarize_and_paraphrase(text_sample)
    print("Summarization Output:")
    print(json.dumps(summary_res, indent=2))
    assert "summary_bullets" in summary_res
    assert "simplified_paraphrase" in summary_res
    print("Summarization: PASSED!\n")

    print("==========================================")
    print("ALL AI FEATURES TESTED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    test_all_ai_features()
