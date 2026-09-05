import nltk
from nltk import word_tokenize, pos_tag, RegexpParser
from typing import Dict, Any, List

def ensure_nltk_resources():
    resources = [
        ('tokenizers/punkt', 'punkt'),
        ('tokenizers/punkt_tab', 'punkt_tab'),
        ('taggers/averaged_perceptron_tagger', 'averaged_perceptron_tagger'),
        ('taggers/averaged_perceptron_tagger_eng', 'averaged_perceptron_tagger_eng'),
    ]
    for path, name in resources:
        try:
            nltk.data.find(path)
        except LookupError:
            try:
                nltk.download(name, quiet=True)
            except Exception as e:
                print(f"[NLTK] Warning downloading {name}: {e}")

class NLTKGrammarParser:
    def __init__(self):
        ensure_nltk_resources()
        grammar_pattern = r"""
            NP: {<DT|PRP\$>?<JJ.*>*<NN.*>+}
            PP: {<IN><NP>}
            VP: {<MD>?<VB.*>+<NP|PP>*}
            SBAR: {<IN|WDT|WP|WRB><NP>?<VP>}
        """
        self.chunk_parser = RegexpParser(grammar_pattern)

    def parse_sentence(self, sentence: str) -> Dict[str, Any]:
        """
        Parses an English sentence using NLTK:
        1. Tokenization
        2. POS Tagging
        3. Chunking (NP, VP, PP, SBAR)
        4. Candidate Subject-Verb-Object (S-V-O) extraction
        """
        tokens = word_tokenize(sentence)
        pos_tags = pos_tag(tokens)
        
        chunk_tree = self.chunk_parser.parse(pos_tags)
        pos_list = [{"word": word, "tag": tag} for word, tag in pos_tags]
        
        noun_phrases: List[str] = []
        verb_phrases: List[str] = []
        prep_phrases: List[str] = []
        
        for subtree in chunk_tree:
            if isinstance(subtree, nltk.Tree):
                phrase_text = " ".join([word for word, tag in subtree.leaves()])
                if subtree.label() == "NP":
                    noun_phrases.append(phrase_text)
                elif subtree.label() == "VP":
                    verb_phrases.append(phrase_text)
                elif subtree.label() == "PP":
                    prep_phrases.append(phrase_text)

        subject_candidate = noun_phrases[0] if noun_phrases else ""
        verb_candidate = verb_phrases[0] if verb_phrases else ""
        object_candidate = noun_phrases[1] if len(noun_phrases) > 1 else ""
        
        return {
            "sentence": sentence,
            "tokens": tokens,
            "pos_tags": pos_list,
            "noun_phrases": noun_phrases,
            "verb_phrases": verb_phrases,
            "prepositional_phrases": prep_phrases,
            "svo_candidates": {
                "subject": subject_candidate,
                "verb": verb_candidate,
                "object": object_candidate
            },
            "tree_structure": str(chunk_tree)
        }
