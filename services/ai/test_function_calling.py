import json
from llm_service import LlamaService

def test_function_calling():
    print("Initializing Llama Service...")
    ai = LlamaService()

    # Define a tool/function schema
    tools_schema = [
        {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA or Hanoi, Vietnam"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "The temperature unit to use."
                    }
                },
                "required": ["location", "unit"]
            }
        }
    ]

    prompt = f"""You are a helpful assistant with access to the following tools:

{json.dumps(tools_schema, indent=2)}

To use a tool, you MUST respond ONLY with a JSON object in the following format. Do not include any other text, greetings, or markdown formatting (no ```json).
{{
  "name": "<function-name>",
  "arguments": {{
    "<arg-name>": "<arg-value>"
  }}
}}

If no tools are needed, you can just answer normally. 

User query: "Can you check the weather in Hanoi right now in celsius?"
"""

    print("\n[PROMPT]")
    print(prompt)
    
    print("\nGenerating response from LLM...")
    response = ai.generate_response(prompt)
    
    print("\n[LLM FUNCTION CALL RESPONSE]")
    print(response)
    
    print("\n[TEST RESULT]")
    try:
        # Clean markdown if generated
        clean_response = response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.startswith("```"):
            clean_response = clean_response[3:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]
        
        clean_response = clean_response.strip()

        parsed_data = json.loads(clean_response)
        
        if "name" in parsed_data and "arguments" in parsed_data:
            print("SUCCESS: LLM successfully generated a function call!")
            print(f"Function called: {parsed_data['name']}")
            print(f"Arguments: {parsed_data['arguments']}")
        else:
            print("FAILED: JSON is valid but does not match the function call format.")
        
    except json.JSONDecodeError as e:
        print(f"FAILED: Could not parse response as JSON.")
        print(f"Error details: {e}")

if __name__ == "__main__":
    test_function_calling()
