from pydantic import BaseModel

class TextPayload(BaseModel):
    text: str

class ChatRequest(BaseModel):
    prompt: str

class TermExplainPayload(BaseModel):
    term: str
    context_sentence: str = ""

class GrammarParsePayload(BaseModel):
    sentence: str

class FlashcardPayload(BaseModel):
    term: str
    context_sentence: str = ""
    definition: str = ""

class ExtractTermsPayload(BaseModel):
    text: str

class SummarizePayload(BaseModel):
    text: str
