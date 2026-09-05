import json
from llm_service import LlamaService

def test_json_format():
    print("Initializing Llama Service...")
    ai = LlamaService()

    format_description = """{
  "word": "<the word>",
  "part_of_speech": "<noun/verb/adjective...>",
  "vietnamese_meaning": "<meaning in Vietnamese>",
  "example_sentences": [
    "<example 1>",
    "<example 2>"
  ]
}"""

    prompt = f"""You are a dictionary assistant. I will give you a word. You must respond strictly in the following JSON format, and do not include any other text, markdown blocks like ```json, or explanations. Only output valid JSON.

Format:
{format_description}

Word to process: "apple"
"""

    print("\n[PROMPT]")
    print(prompt)
    
    print("\nGenerating response from LLM...")
    response = ai.generate_response(prompt)
    
    print("\n[LLM RAW RESPONSE]")
    print(response)
    
    print("\n[TEST RESULT]")
    try:
        # Some models might still output markdown blocks despite instructions, so we optionally clean it up.
        clean_response = response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.startswith("```"):
            clean_response = clean_response[3:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]
        
        clean_response = clean_response.strip()

        parsed_data = json.loads(clean_response)
        print("SUCCESS: LLM response successfully parsed as JSON!")
        print("Parsed data object:")
        print(json.dumps(parsed_data, indent=2, ensure_ascii=False))
        
    except json.JSONDecodeError as e:
        print(f"FAILED: Could not parse response as JSON.")
        print(f"Error details: {e}")

if __name__ == "__main__":
    test_json_format()
