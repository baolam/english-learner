import re
from typing import Dict, Any, List
import nltk
from app.core.nltk_parser import NLTKGrammarParser

class FastAIProcessor:
    def __init__(self, nltk_parser: NLTKGrammarParser):
        self.nltk_parser = nltk_parser

    def _map_pos_tag(self, tag: str) -> str:
        if tag.startswith("NN"):
            return "noun"
        elif tag.startswith("VB"):
            return "verb"
        elif tag.startswith("JJ"):
            return "adjective"
        elif tag.startswith("RB"):
            return "adverb"
        elif tag == "IN":
            return "preposition"
        return "term"

    def fast_explain_term(self, term: str, context_sentence: str = "") -> Dict[str, Any]:
        nltk_data = self.nltk_parser.parse_sentence(context_sentence if context_sentence else term)
        pos_list = nltk_data.get("pos_tags", [])
        
        term_lower = term.lower()
        matched_tag = "NN"
        for item in pos_list:
            if item["word"].lower() in term_lower or term_lower in item["word"].lower():
                matched_tag = item["tag"]
                break
                
        pos = self._map_pos_tag(matched_tag)
        
        collocations = [phrase for phrase in nltk_data.get("noun_phrases", []) if phrase.lower() != term_lower][:3]
        if not collocations:
            collocations = [f"academic {term}", f"key {term}"]
            
        examples = []
        if context_sentence:
            examples.append(context_sentence)
        examples.append(f"The study analyzed the impact of {term} in modern contexts.")
        
        return {
            "term": term,
            "ipa": f"/{term.lower()}/",
            "part_of_speech": pos,
            "domain": "General Academic",
            "english_definition": f"Core term '{term}' identified from text context.",
            "academic_collocations": collocations,
            "example_sentences": examples,
            "is_fast": True,
            "algorithm": "nltk_fast"
        }

    def fast_grammar_parse(self, sentence: str) -> Dict[str, Any]:
        nltk_data = self.nltk_parser.parse_sentence(sentence)
        svo = nltk_data.get("svo_candidates", {})
        
        subject = svo.get("subject") or "Subject"
        verb = svo.get("verb") or "Verb"
        obj = svo.get("object") or "Object"
        
        notes = []
        if nltk_data.get("noun_phrases"):
            notes.append(f"Noun Phrases: {', '.join(nltk_data['noun_phrases'])}")
        if nltk_data.get("verb_phrases"):
            notes.append(f"Verb Phrases: {', '.join(nltk_data['verb_phrases'])}")
        if nltk_data.get("prepositional_phrases"):
            notes.append(f"Prepositional Phrases: {', '.join(nltk_data['prepositional_phrases'])}")
            
        simplified = f"{subject} {verb} {obj}".strip()
        
        return {
            "original_sentence": sentence,
            "simplified_sentence": simplified,
            "subject": subject,
            "verb": verb,
            "object": obj,
            "grammar_notes": notes,
            "nltk_analysis": nltk_data,
            "is_fast": True,
            "algorithm": "nltk_fast"
        }

    def fast_extract_terms(self, text: str) -> Dict[str, Any]:
        nltk_data = self.nltk_parser.parse_sentence(text)
        nps = nltk_data.get("noun_phrases", [])
        
        unique_terms = []
        seen = set()
        for np in nps:
            cleaned = np.strip()
            if len(cleaned) > 2 and cleaned.lower() not in seen and not cleaned.lower().startswith(('a ', 'an ', 'the ')):
                seen.add(cleaned.lower())
                unique_terms.append(cleaned)
                
        terms_list = []
        for t in unique_terms[:4]:
            terms_list.append({
                "term": t,
                "difficulty": "Intermediate",
                "context": text[:150] if len(text) > 150 else text,
                "english_definition": f"Key term '{t}' extracted from passage."
            })
            
        return {
            "terms": terms_list,
            "is_fast": True,
            "algorithm": "nltk_fast"
        }

    def fast_summarize_paraphrase(self, text: str) -> Dict[str, Any]:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
        
        bullets = sentences[:3] if sentences else [text]
        simplified = sentences[0] if sentences else text
        takeaways = [bullets[0]] if bullets else [text]
        
        return {
            "summary_bullets": bullets,
            "simplified_paraphrase": simplified,
            "key_takeaways": takeaways,
            "is_fast": True,
            "algorithm": "nltk_fast"
        }

    def fast_generate_flashcard(self, term: str, context_sentence: str = "", definition: str = "") -> Dict[str, Any]:
        ctx = context_sentence if context_sentence else term
        defn = definition if definition else f"The meaning and usage of '{term}'"
        
        return {
            "deck_name": "English Learner",
            "front": f"What does the term '{term}' mean in this context?\n\n\"{ctx}\"",
            "back": f"Definition: {defn}\n\nTerm: {term}",
            "is_fast": True,
            "algorithm": "fast_template"
        }
