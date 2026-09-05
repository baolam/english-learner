from llm_service import LlamaService

def test_summarization():
    print("Initializing Llama Service...")
    ai = LlamaService()

    # A long text to summarize
    long_text = """
    Language learning is an active process that begins at birth and continues throughout life. Students learn language as they use it to communicate their thoughts, feelings, and experiences, establish relationships with family members and friends, and strive to make sense and order of their world. They may come to school speaking more than one language, or learn another language in school. It is important to respect and build upon the language skills students already possess.
    
    Learning another language can enhance knowledge of the first language. In addition, there is evidence that learning another language can benefit cognitive development. The ability to speak, read, and write in more than one language is a valuable asset in today's global economy.
    
    To be successful, language learners must be exposed to language that is comprehensible to them. They must also have opportunities to use the language in meaningful contexts. Teachers can support language learning by creating a classroom environment that is rich in language, where students feel comfortable taking risks and making mistakes.
    
    Practice and repetition are also key components of language acquisition. By engaging with the language daily, whether through reading, listening, speaking, or writing, learners reinforce their memory and improve their fluency over time.
    """

    prompt = f"""You are a highly skilled AI assistant. Please summarize the following text into exactly 3 bullet points, highlighting the most important concepts.

Text to summarize:
\"\"\"{long_text}\"\"\"

Summary:"""

    print("\n[PROMPT]")
    print(prompt)
    
    print("\nGenerating summary from LLM...")
    response = ai.generate_response(prompt)
    
    print("\n[LLM SUMMARY RESPONSE]")
    print(response)

if __name__ == "__main__":
    test_summarization()
