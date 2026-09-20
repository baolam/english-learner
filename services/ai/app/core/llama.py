import os
import json
import re
from huggingface_hub import hf_hub_download
from llama_cpp import Llama
from typing import Dict, Any, List, Optional

MODEL_CONFIGS = {
    "1b": {
        "repo_id": "lmstudio-community/Llama-3.2-1B-Instruct-GGUF",
        "filename": "Llama-3.2-1B-Instruct-Q4_K_M.gguf",
        "approx_size": "800MB"
    },
    "3b": {
        "repo_id": "lmstudio-community/Llama-3.2-3B-Instruct-GGUF",
        "filename": "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
        "approx_size": "2.0GB"
    }
}

class LlamaService:
    def __init__(self, model_size: str = "1b"):
        self.model_size = model_size.lower() if model_size.lower() in MODEL_CONFIGS else "1b"
        
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.model_dir = os.path.join(base_dir, "models")
        self.llm = None
        
        self.load_model(self.model_size)

    def load_model(self, model_size: str):
        target_size = model_size.lower()
        if target_size not in MODEL_CONFIGS:
            target_size = "1b"
            
        config = MODEL_CONFIGS[target_size]
        self.model_size = target_size
        self.repo_id = config["repo_id"]
        self.filename = config["filename"]
        self.model_path = os.path.join(self.model_dir, self.filename)
        
        self._ensure_model_downloaded()
        
        print(f"Loading Llama {self.model_size.upper()} model ({self.filename}) with llama-cpp-python...")
        if self.llm is not None:
            del self.llm
            self.llm = None

        self.llm = Llama(
            model_path=self.model_path,
            n_ctx=2048,
            n_batch=256,
            n_gpu_layers=0, # CPU Mode
            verbose=False
        )
        print(f"Llama 3.2 {self.model_size.upper()} Service initialized.")

    def switch_model(self, model_size: str) -> Dict[str, Any]:
        """Dynamically switch between 1b and 3b models."""
        target_size = model_size.lower()
        if target_size not in MODEL_CONFIGS:
            return {"status": "error", "message": f"Unsupported model size '{model_size}'. Supported: '1b', '3b'"}
        
        if target_size == self.model_size and self.llm is not None:
            return {"status": "success", "message": f"Model is already set to {self.model_size.upper()}", "current_model": self.model_size}
        
        self.load_model(target_size)
        return {"status": "success", "message": f"Switched to Llama 3.2 {self.model_size.upper()} model", "current_model": self.model_size}

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "current_model": self.model_size,
            "filename": self.filename,
            "model_path": self.model_path,
            "available_models": list(MODEL_CONFIGS.keys()),
            "loaded": self.llm is not None
        }

    def _ensure_model_downloaded(self):
        os.makedirs(self.model_dir, exist_ok=True)
        if not os.path.exists(self.model_path):
            approx_size = MODEL_CONFIGS[self.model_size]["approx_size"]
            print(f"Downloading model {self.filename} to {self.model_dir} (Approx {approx_size})...")
            hf_hub_download(
                repo_id=self.repo_id,
                filename=self.filename,
                local_dir=self.model_dir
            )
            print("Download complete!")

    def _format_chat_prompt(self, user_prompt: str, system_prompt: str = "You are a helpful AI assistant. You answer strictly in English.", history: Optional[List[Dict[str, Any]]] = None) -> str:
        """Formats multi-turn chat history into Llama 3 header tokens."""
        prompt_parts = [f"<|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|>"]
        
        if history:
            for msg in history:
                role = msg.get("role", "user").lower()
                content = msg.get("content") or msg.get("message") or msg.get("text") or ""
                if content:
                    if role in ("user", "human"):
                        prompt_parts.append(f"<|start_header_id|>user<|end_header_id|>\n\n{content}<|eot_id|>")
                    elif role in ("assistant", "ai", "bot"):
                        prompt_parts.append(f"<|start_header_id|>assistant<|end_header_id|>\n\n{content}<|eot_id|>")

        if user_prompt:
            prompt_parts.append(f"<|start_header_id|>user<|end_header_id|>\n\n{user_prompt}<|eot_id|>")
            
        prompt_parts.append("<|start_header_id|>assistant<|end_header_id|>\n\n")
        return "".join(prompt_parts)

    def generate_response(self, user_prompt: str, system_prompt: str = "You are a helpful AI assistant. You answer strictly in English.", history: Optional[List[Dict[str, Any]]] = None) -> str:
        prompt = self._format_chat_prompt(user_prompt, system_prompt, history)
        
        try:
            output = self.llm(
                prompt,
                max_tokens=600,
                temperature=0.1,
                stop=["<|eot_id|>"],
                echo=False
            )
            answer = output["choices"][0]["text"].strip()
            return answer
        except Exception as e:
            return f"[Llama-cpp Error] {e}"

    def generate_stream(self, user_prompt: str, history: Optional[List[Dict[str, Any]]] = None):
        system_prompt = "You are a helpful AI assistant. You answer strictly in English."
        prompt = self._format_chat_prompt(user_prompt, system_prompt, history)
        try:
            stream = self.llm(
                prompt,
                max_tokens=600,
                temperature=0.1,
                stop=["<|eot_id|>"],
                echo=False,
                stream=True
            )
            for chunk in stream:
                text = chunk["choices"][0]["text"]
                yield text
        except Exception as e:
            yield f"[Llama-cpp Stream Error] {e}"


    def clean_json_output(self, raw_text: str) -> Dict[str, Any]:
        """Cleans markdown wrappers, trailing commas, and parses JSON response safely."""
        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        # Extract JSON object substring between first { and last }
        start_idx = text.find("{")
        end_idx = text.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            text = text[start_idx:end_idx + 1]

        # Fix trailing commas before closing braces/brackets
        text_clean = re.sub(r',\s*([\}\]])', r'\1', text)

        try:
            return json.loads(text_clean)
        except json.JSONDecodeError:
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                return {"raw_response": raw_text, "error": "JSON decode error"}

    # -------------------------------------------------------------
    # Structured Output Generation Methods (English Only)
    # -------------------------------------------------------------

    def explain_term(self, term: str, context_sentence: str = "") -> Dict[str, Any]:
        """Generates English-only structured dictionary explanation for a term."""
        system_prompt = "You are an English lexicographer and dictionary assistant. Answer strictly in valid JSON format with NO markdown code blocks. Explain everything exclusively in English."
        
        user_prompt = f"""Target term: "{term}"
Context sentence: "{context_sentence}"

Provide a structured JSON output matching this schema:
{{
  "term": "{term}",
  "ipa": "<IPA pronunciation>",
  "part_of_speech": "<noun/verb/adjective/etc>",
  "domain": "<field of study or academic domain>",
  "english_definition": "<clear English definition>",
  "academic_collocations": ["<collocation 1>", "<collocation 2>"],
  "example_sentences": ["<example sentence 1>", "<example sentence 2>"]
}}"""

        raw = self.generate_response(user_prompt, system_prompt)
        return self.clean_json_output(raw)

    def parse_grammar_with_nltk(self, sentence: str, nltk_data: Dict[str, Any]) -> Dict[str, Any]:
        """Combines NLTK syntactic breakdown with Llama to generate English grammar analysis."""
        system_prompt = "You are an expert English grammar tutor. Output strictly in valid JSON format. All explanations and notes must be in English only."

        user_prompt = f"""Sentence to analyze: "{sentence}"

NLTK Pre-Parsed Structure:
- Syntactic tree: {nltk_data.get('tree_structure', '')}
- Candidate Subject: {nltk_data.get('svo_candidates', {}).get('subject', '')}
- Candidate Verb: {nltk_data.get('svo_candidates', {}).get('verb', '')}

Provide a grammar breakdown in strict JSON format:
{{
  "original_sentence": "{sentence}",
  "simplified_sentence": "<simplified core version of sentence in English>",
  "subject": "<main grammatical subject>",
  "verb": "<main grammatical verb>",
  "object": "<main grammatical object>",
  "grammar_notes": [
    "<English note on sentence structure>",
    "<English note on key connectors or grammar pattern>"
  ]
}}"""

        raw = self.generate_response(user_prompt, system_prompt)
        parsed = self.clean_json_output(raw)
        parsed["nltk_analysis"] = nltk_data
        return parsed

    def generate_flashcard(self, term: str, context_sentence: str = "", definition: str = "") -> Dict[str, Any]:
        """Generates English-only flashcard content for Anki SRS."""
        system_prompt = "You are an Anki flashcard generator. Return strictly valid JSON with no inner quotes or markdown."

        user_prompt = f"""Create an Anki flashcard for the term: {term}
Context: {context_sentence}
Definition: {definition}

Format as strict JSON:
{{
  "deck_name": "English Learner",
  "front": "What does the term '{term}' mean in this sentence: {context_sentence}?",
  "back": "Definition: {definition}. Usage note: {term} is commonly used in academic texts."
}}"""

        raw = self.generate_response(user_prompt, system_prompt)
        return self.clean_json_output(raw)

    def extract_key_terms(self, text: str) -> Dict[str, Any]:
        """Scans text to extract 3-5 key academic terms with English definitions."""
        system_prompt = "You are an academic reader assistant. Extract key terminology in strict JSON format using English only."

        user_prompt = f"""Text snippet: "{text}"

Extract up to 4 important terms in JSON:
{{
  "terms": [
    {{
      "term": "<term>",
      "difficulty": "<Beginner/Intermediate/Advanced>",
      "context": "<excerpt from text containing term>",
      "english_definition": "<concise English definition>"
    }}
  ]
}}"""

        raw = self.generate_response(user_prompt, system_prompt)
        return self.clean_json_output(raw)

    def summarize_and_paraphrase(self, text: str) -> Dict[str, Any]:
        """Summarizes and paraphrases academic text snippets in English."""
        system_prompt = "You are an academic writing assistant. Summarize and paraphrase in strict JSON format using English only."

        user_prompt = f"""Text to summarize: "{text}"

Provide a JSON response:
{{
  "summary_bullets": ["<bullet point 1 in English>", "<bullet point 2 in English>"],
  "simplified_paraphrase": "<a clear, simplified English paraphrase>",
  "key_takeaways": ["<main takeaway in English>"]
}}"""

        raw = self.generate_response(user_prompt, system_prompt)
        return self.clean_json_output(raw)
