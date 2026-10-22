-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "Schedule" ADD COLUMN "icon" TEXT;
ALTER TABLE "Schedule" ADD COLUMN "widgets" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AnkiSetting";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ReadingMaterial";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SavedWord";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subject_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT,
    "studySessionId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "author" TEXT,
    "publishedYear" INTEGER,
    "localPath" TEXT,
    "sourceUrl" TEXT,
    "fileType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "readingProgress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "aiParaphrase" TEXT,
    "aiSummary" TEXT,
    "pageNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Highlight_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'Untitled Session',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "aiSummary" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "termType" TEXT NOT NULL DEFAULT 'VOCAB',
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "documentId" TEXT,
    "screenshotId" TEXT,
    "audioRecordId" TEXT,
    "sessionId" TEXT,
    "term" TEXT NOT NULL,
    "contextSentence" TEXT,
    "aiExplanation" TEXT,
    "ankiSyncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "obsidianSyncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Term_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Term_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "Screenshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Term_audioRecordId_fkey" FOREIGN KEY ("audioRecordId") REFERENCES "AudioRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Term_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConceptRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "sourceTermId" TEXT NOT NULL,
    "targetTermId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'RELATED_TO',
    CONSTRAINT "ConceptRelation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConceptRelation_sourceTermId_fkey" FOREIGN KEY ("sourceTermId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConceptRelation_targetTermId_fkey" FOREIGN KEY ("targetTermId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "defaultDeckName" TEXT NOT NULL DEFAULT 'LingoAnki Default',
    "defaultModelName" TEXT NOT NULL DEFAULT 'Basic',
    "ankiConnectUrl" TEXT NOT NULL DEFAULT 'http://127.0.0.1:8765',
    "autoSyncAnki" BOOLEAN NOT NULL DEFAULT false,
    "obsidianVaultPath" TEXT,
    "autoSyncObsidian" BOOLEAN NOT NULL DEFAULT false,
    "screenshotHotkey" TEXT NOT NULL DEFAULT 'windows+shift+s',
    "audioHotkey" TEXT NOT NULL DEFAULT 'ctrl+shift+a',
    "textHotkey" TEXT NOT NULL DEFAULT 'ctrl+q',
    "vadEnabled" BOOLEAN NOT NULL DEFAULT true,
    "vadThreshold" REAL NOT NULL DEFAULT 0.5,
    "vadSilenceDuration" REAL NOT NULL DEFAULT 1.2,
    "vadUseGpu" BOOLEAN NOT NULL DEFAULT true,
    "marqueeText" TEXT NOT NULL DEFAULT '🔥 QUYẾT TÂM!!!!! • Có tiền ít thì từ thiện ít, nhiều thì từ thiện nhiều nha!!! • Học cái hiểu biết nhiều để biết ơn • Lấy tham thiền làm niềm vui • English learner! (chuẩn bị về các cơ chế management và cách thu âm) • Bản vẽ • PHẢI OBSERVATION NHIỀU HƠN NỮA!!!!! • PHẢI BIẾT LƯỢNG SỨC MÌNH!!!',
    "marqueeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "marqueeSpeed" REAL NOT NULL DEFAULT 1.0,
    "marqueeDirection" TEXT NOT NULL DEFAULT 'left',
    "geminiApiKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_TagToTerm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TagToTerm_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TagToTerm_B_fkey" FOREIGN KEY ("B") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DocumentToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DocumentToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DocumentToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_StudySessionToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_StudySessionToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "StudySession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StudySessionToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AudioRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "extractedText" TEXT,
    "duration" REAL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AudioRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AudioRecord" ("createdAt", "extractedText", "filename", "id", "originalName", "updatedAt") SELECT "createdAt", "extractedText", "filename", "id", "originalName", "updatedAt" FROM "AudioRecord";
DROP TABLE "AudioRecord";
ALTER TABLE "new_AudioRecord" RENAME TO "AudioRecord";
CREATE UNIQUE INDEX "AudioRecord_filename_key" ON "AudioRecord"("filename");
CREATE INDEX "AudioRecord_sessionId_idx" ON "AudioRecord"("sessionId");
CREATE TABLE "new_ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "sourceType" TEXT NOT NULL DEFAULT 'GENERAL',
    "documentId" TEXT,
    "screenshotId" TEXT,
    "audioRecordId" TEXT,
    "sessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChatSession_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatSession_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "Screenshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatSession_audioRecordId_fkey" FOREIGN KEY ("audioRecordId") REFERENCES "AudioRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ChatSession" ("audioRecordId", "createdAt", "id", "screenshotId", "sourceType", "title", "updatedAt") SELECT "audioRecordId", "createdAt", "id", "screenshotId", "sourceType", "title", "updatedAt" FROM "ChatSession";
DROP TABLE "ChatSession";
ALTER TABLE "new_ChatSession" RENAME TO "ChatSession";
CREATE INDEX "ChatSession_documentId_idx" ON "ChatSession"("documentId");
CREATE INDEX "ChatSession_screenshotId_idx" ON "ChatSession"("screenshotId");
CREATE INDEX "ChatSession_audioRecordId_idx" ON "ChatSession"("audioRecordId");
CREATE INDEX "ChatSession_sessionId_idx" ON "ChatSession"("sessionId");
CREATE TABLE "new_Flashcard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deckId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "nextReviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "externalNoteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Flashcard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Flashcard_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Flashcard" ("back", "createdAt", "deckId", "easeFactor", "externalNoteId", "front", "id", "interval", "nextReviewDate", "repetition", "updatedAt") SELECT "back", "createdAt", "deckId", "easeFactor", "externalNoteId", "front", "id", "interval", "nextReviewDate", "repetition", "updatedAt" FROM "Flashcard";
DROP TABLE "Flashcard";
ALTER TABLE "new_Flashcard" RENAME TO "Flashcard";
CREATE UNIQUE INDEX "Flashcard_termId_key" ON "Flashcard"("termId");
CREATE INDEX "Flashcard_deckId_idx" ON "Flashcard"("deckId");
CREATE TABLE "new_Screenshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "extractedText" TEXT,
    "windowTitle" TEXT,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Screenshot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Screenshot" ("createdAt", "extractedText", "filename", "id", "originalName", "updatedAt") SELECT "createdAt", "extractedText", "filename", "id", "originalName", "updatedAt" FROM "Screenshot";
DROP TABLE "Screenshot";
ALTER TABLE "new_Screenshot" RENAME TO "Screenshot";
CREATE UNIQUE INDEX "Screenshot_filename_key" ON "Screenshot"("filename");
CREATE INDEX "Screenshot_sessionId_idx" ON "Screenshot"("sessionId");
CREATE TABLE "new_Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "scheduleId" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Todo_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Todo_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Todo" ("createdAt", "description", "id", "isCompleted", "parentId", "scheduleId", "title", "updatedAt") SELECT "createdAt", "description", "id", "isCompleted", "parentId", "scheduleId", "title", "updatedAt" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
CREATE INDEX "Todo_scheduleId_idx" ON "Todo"("scheduleId");
CREATE INDEX "Todo_parentId_idx" ON "Todo"("parentId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "Subject_parentId_idx" ON "Subject"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Document_subjectId_idx" ON "Document"("subjectId");

-- CreateIndex
CREATE INDEX "Document_studySessionId_idx" ON "Document"("studySessionId");

-- CreateIndex
CREATE INDEX "Highlight_documentId_idx" ON "Highlight"("documentId");

-- CreateIndex
CREATE INDEX "Term_documentId_idx" ON "Term"("documentId");

-- CreateIndex
CREATE INDEX "Term_screenshotId_idx" ON "Term"("screenshotId");

-- CreateIndex
CREATE INDEX "Term_audioRecordId_idx" ON "Term"("audioRecordId");

-- CreateIndex
CREATE INDEX "Term_sessionId_idx" ON "Term"("sessionId");

-- CreateIndex
CREATE INDEX "ConceptRelation_sessionId_idx" ON "ConceptRelation"("sessionId");

-- CreateIndex
CREATE INDEX "ConceptRelation_sourceTermId_idx" ON "ConceptRelation"("sourceTermId");

-- CreateIndex
CREATE INDEX "ConceptRelation_targetTermId_idx" ON "ConceptRelation"("targetTermId");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptRelation_sessionId_sourceTermId_targetTermId_relationType_key" ON "ConceptRelation"("sessionId", "sourceTermId", "targetTermId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToTerm_AB_unique" ON "_TagToTerm"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToTerm_B_index" ON "_TagToTerm"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToTag_AB_unique" ON "_DocumentToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToTag_B_index" ON "_DocumentToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_StudySessionToTag_AB_unique" ON "_StudySessionToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_StudySessionToTag_B_index" ON "_StudySessionToTag"("B");

-- CreateIndex
CREATE INDEX "AiChatHistory_chatSessionId_idx" ON "AiChatHistory"("chatSessionId");

-- CreateIndex
CREATE INDEX "Notification_todoId_idx" ON "Notification"("todoId");

