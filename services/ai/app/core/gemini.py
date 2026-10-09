import os
import json
import urllib.request
import urllib.error
import re
from typing import Dict, Any, List, Optional
from app.config import GEMINI_API_KEY, get_gemini_config

class GeminiService:
    """Cloud API Service leveraging Google Gemini REST API."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        self.model_name = "gemini-1.5-flash"
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and self.api_key != "your-gemini-api-key")

    def _call_gemini_api(self, prompt: str, system_prompt: Optional[str] = None, json_mode: bool = False) -> str:
        if not self.is_configured():
            raise ValueError("Gemini API key is not configured.")

        url = f"{self.base_url}?key={self.api_key}"
        
        contents = []
        if system_prompt:
            contents.append({
                "role": "user",
                "parts": [{"text": f"System Instructions: {system_prompt}\n\nUser Input: {prompt}"}]
            })
        else:
            contents.append({
                "role": "user",
                "parts": [{"text": prompt}]
            })

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024,
            }
        }
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                candidates = res_body.get("candidates", [])
                if not candidates:
                    raise ValueError("No candidates returned from Gemini API.")
                
                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    raise ValueError("Empty response text from Gemini API.")
                
                return parts[0].get("text", "").strip()
        except urllib.error.HTTPError as e:
            error_msg = e.read().decode("utf-8")
            raise RuntimeError(f"Gemini HTTP Error ({e.code}): {error_msg}")
        except Exception as e:
            raise RuntimeError(f"Gemini API Request Failed: {e}")

    def clean_json_output(self, raw_text: str) -> Dict[str, Any]:
        """Cleans markdown syntax and parses JSON payload safely."""
        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        start_idx = text.find("{")
        end_idx = text.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            text = text[start_idx:end_idx + 1]

        text_clean = re.sub(r',\s*([\}\]])', r'\1', text)

        try:
            return json.loads(text_clean)
        except json.JSONDecodeError:
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                return {"raw_response": raw_text, "error": "JSON decode error"}

    def generate_response(self, user_prompt: str, system_prompt: str = "You are an academic AI assistant. Answer in English.", history: Optional[List[Dict[str, Any]]] = None) -> str:
        prompt_with_history = user_prompt
        if history:
            hist_str = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in history[-5:]])
            prompt_with_history = f"Conversation History:\n{hist_str}\n\nCurrent Prompt: {user_prompt}"
            
        return self._call_gemini_api(prompt_with_history, system_prompt=system_prompt)

    def explain_term(self, term: str, context_sentence: str = "") -> Dict[str, Any]:
        system_prompt = "You are an English lexicographer. Provide structured JSON output in English."
        user_prompt = f"""Target term: "{term}"
Context: "{context_sentence}"
Return strictly JSON schema:
{{
  "term": "{term}",
  "ipa": "<IPA>",
  "part_of_speech": "<noun/verb/etc>",
  "domain": "<academic domain>",
  "english_definition": "<definition>",
  "academic_collocations": ["<collocation 1>", "<collocation 2>"],
  "example_sentences": ["<example 1>", "<example 2>"]
}}"""
        raw = self._call_gemini_api(user_prompt, system_prompt=system_prompt, json_mode=True)
        return self.clean_json_output(raw)

    def parse_grammar(self, sentence: str, nltk_data: Dict[str, Any]) -> Dict[str, Any]:
        system_prompt = "You are an expert English grammar tutor. Output strict JSON in English."
        user_prompt = f"""Sentence: "{sentence}"
NLTK Hints: Subject={nltk_data.get('svo_candidates', {}).get('subject')}, Verb={nltk_data.get('svo_candidates', {}).get('verb')}
Return strictly JSON schema:
{{
  "original_sentence": "{sentence}",
  "simplified_sentence": "<simplified sentence>",
  "subject": "<subject>",
  "verb": "<verb>",
  "object": "<object>",
  "grammar_notes": ["<note 1>", "<note 2>"]
}}"""
        raw = self._call_gemini_api(user_prompt, system_prompt=system_prompt, json_mode=True)
        parsed = self.clean_json_output(raw)
        parsed["nltk_analysis"] = nltk_data
        return parsed

    def generate_flashcard(self, term: str, context_sentence: str = "", definition: str = "") -> Dict[str, Any]:
        system_prompt = "You are an Anki flashcard generator. Return strict JSON."
        user_prompt = f"""Term: {term}
Context: {context_sentence}
Definition: {definition}
Return JSON schema:
{{
  "deck_name": "English Learner",
  "front": "What does the term '{term}' mean in this sentence: {context_sentence}?",
  "back": "Definition: {definition}. Usage note: {term} is commonly used in academic texts."
}}"""
        raw = self._call_gemini_api(user_prompt, system_prompt=system_prompt, json_mode=True)
        return self.clean_json_output(raw)

    def extract_key_terms(self, text: str) -> Dict[str, Any]:
        system_prompt = "You are an academic reader assistant. Extract key terms in strict JSON format."
        user_prompt = f"""Text snippet: "{text}"
Return JSON schema:
{{
  "terms": [
    {{
      "term": "<term>",
      "difficulty": "<Intermediate/Advanced>",
      "context": "<context snippet>",
      "english_definition": "<definition>"
    }}
  ]
}}"""
        raw = self._call_gemini_api(user_prompt, system_prompt=system_prompt, json_mode=True)
        return self.clean_json_output(raw)

    def summarize_and_paraphrase(self, text: str) -> Dict[str, Any]:
        system_prompt = "You are an academic writing assistant. Summarize and paraphrase in JSON."
        user_prompt = f"""Text to summarize: "{text}"
Return JSON schema:
{{
  "summary_bullets": ["<bullet 1>", "<bullet 2>"],
  "simplified_paraphrase": "<paraphrase>",
  "key_takeaways": ["<takeaway 1>"]
}}"""
        raw = self._call_gemini_api(user_prompt, system_prompt=system_prompt, json_mode=True)
        return self.clean_json_output(raw)
