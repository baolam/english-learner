# Backward-compatibility bridge
from app.core.nltk_parser import NLTKGrammarParser, ensure_nltk_resources

__all__ = ["NLTKGrammarParser", "ensure_nltk_resources"]
