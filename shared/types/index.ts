// -------------------------------------------------------------
// Enums matching System Data Architecture
// -------------------------------------------------------------

export enum DocumentStatus {
  UNREAD = 'UNREAD',
  READING = 'READING',
  COMPLETED = 'COMPLETED'
}

export enum FileType {
  PDF = 'PDF',
  EPUB = 'EPUB',
  URL = 'URL',
  TEXT = 'TEXT'
}

export enum StudyCategory {
  GENERAL = 'GENERAL',
  MEETING = 'MEETING',
  LECTURE = 'LECTURE',
  RESEARCH = 'RESEARCH',
  ENGLISH = 'ENGLISH',
  CODING = 'CODING'
}

export enum StudyStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum TermType {
  VOCAB = 'VOCAB',
  CONCEPT = 'CONCEPT'
}

export enum SourceType {
  MANUAL = 'MANUAL',
  READING = 'READING',
  SCREENSHOT = 'SCREENSHOT',
  AUDIO = 'AUDIO'
}

export enum AnkiSyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED'
}

export enum ObsidianSyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED'
}

export enum RelationType {
  RELATED_TO = 'RELATED_TO',
  CONTAINS = 'CONTAINS',
  LEADS_TO = 'LEADS_TO',
  DEPENDS_ON = 'DEPENDS_ON',
  USES = 'USES'
}

export enum ChatSourceType {
  GENERAL = 'GENERAL',
  READING = 'READING',
  SCREENSHOT = 'SCREENSHOT',
  AUDIO = 'AUDIO'
}

export enum ChatRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT'
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  REMINDER = 'REMINDER',
  UPDATE = 'UPDATE'
}

// -------------------------------------------------------------
// JSON Structured Data Schemas & Interfaces
// -------------------------------------------------------------

export interface TermAiExplanation {
  ipa?: string;
  definition?: string;
  vietnameseMeaning?: string;
  collocations?: string[];
  exampleSentences?: string[];
  synonyms?: string[];
  antonyms?: string[];
  grammarNotes?: string;
}

export interface ExtractedChatData {
  extractedFlashcards?: Array<{
    front: string;
    back: string;
    context?: string;
  }>;
  extractedConcepts?: Array<{
    concept: string;
    definition: string;
  }>;
  grammarPoints?: Array<{
    point: string;
    explanation: string;
  }>;
}

// -------------------------------------------------------------
// DTOs & Domain Interfaces
// -------------------------------------------------------------

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

export interface IntegrationSettingDTO {
  id: string;
  defaultDeckName: string;
  defaultModelName: string;
  ankiConnectUrl: string;
  autoSyncAnki: boolean;
  obsidianVaultPath: string | null;
  autoSyncObsidian: boolean;
  screenshotHotkey: string;
  audioHotkey: string;
  textHotkey: string;
  vadEnabled: boolean;
  vadThreshold: number;
  vadSilenceDuration: number;
  vadUseGpu: boolean;
  marqueeText: string;
  marqueeEnabled: boolean;
  marqueeSpeed: number;
  marqueeDirection: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
