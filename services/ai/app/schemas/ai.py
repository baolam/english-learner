from pydantic import BaseModel
from typing import Optional, List, Any

class TextPayload(BaseModel):
    text: str

class ChatRequest(BaseModel):
    prompt: Optional[str] = None
    message: Optional[str] = None
    text: Optional[str] = None
    history: Optional[List[Any]] = None
    mode: Optional[str] = "auto"  # "auto", "local", "api", "fast"
    heavy: Optional[bool] = False
    prefer_cloud: Optional[bool] = False

    def get_effective_prompt(self) -> str:
        return self.prompt or self.message or self.text or ""

class TermExplainPayload(BaseModel):
    term: str
    context_sentence: str = ""
    fast: Optional[bool] = False
    fast_mode: Optional[bool] = False
    fast_first: Optional[bool] = False
    mode: Optional[str] = "auto"
    heavy: Optional[bool] = False

class GrammarParsePayload(BaseModel):
    sentence: str
    fast: Optional[bool] = False
    fast_mode: Optional[bool] = False
    fast_first: Optional[bool] = False
    mode: Optional[str] = "auto"
    heavy: Optional[bool] = False

class FlashcardPayload(BaseModel):
    term: str
    context_sentence: str = ""
    definition: str = ""
    fast: Optional[bool] = False
    fast_mode: Optional[bool] = False
    fast_first: Optional[bool] = False
    mode: Optional[str] = "auto"

class ExtractTermsPayload(BaseModel):
    text: str
    fast: Optional[bool] = False
    fast_mode: Optional[bool] = False
    fast_first: Optional[bool] = False
    mode: Optional[str] = "auto"
    heavy: Optional[bool] = False

class SummarizePayload(BaseModel):
    text: str
    fast: Optional[bool] = False
    fast_mode: Optional[bool] = False
    fast_first: Optional[bool] = False
    mode: Optional[str] = "auto"
    heavy: Optional[bool] = False

class SetModelPayload(BaseModel):
    model_size: str = "1b"
