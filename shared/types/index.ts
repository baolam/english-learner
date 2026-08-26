export interface AnkiCard {
  cardId: number;
  noteId: number;
  front: string;
  back: string;
  deckName: string;
}

export interface StoryGenerationRequest {
  words: string[];
}

export interface StoryGenerationResponse {
  success: boolean;
  story?: string;
  error?: string;
}

export interface WritingEvaluationRequest {
  prompt: string;
  userText: string;
  targetWords: string[];
}

export interface WritingEvaluationResponse {
  score: number; // 0-10
  feedback: string;
  grammarCorrections: string[];
}

export interface ReverseFlashcardRequest {
  deckName: string;
  modelName: string;
  front: string; // The vocabulary word
  back: string; // The meaning/translation
  context: string; // The AI-generated context sentence
}

export interface ReverseFlashcardResponse {
  success: boolean;
  noteId?: number;
  error?: string;
}
