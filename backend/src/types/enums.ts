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

export enum TermType {
  VOCAB = 'VOCAB',
  CONCEPT = 'CONCEPT'
}

export enum TermSourceType {
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
