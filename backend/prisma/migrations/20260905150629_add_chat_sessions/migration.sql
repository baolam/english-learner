/*
  Warnings:

  - You are about to drop the column `readingMaterialId` on the `AiChatHistory` table. All the data in the column will be lost.
  - Added the required column `chatSessionId` to the `AiChatHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "sourceType" TEXT NOT NULL DEFAULT 'GENERAL',
    "readingMaterialId" TEXT,
    "screenshotId" TEXT,
    "audioRecordId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChatSession_readingMaterialId_fkey" FOREIGN KEY ("readingMaterialId") REFERENCES "ReadingMaterial" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatSession_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "Screenshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatSession_audioRecordId_fkey" FOREIGN KEY ("audioRecordId") REFERENCES "AudioRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AiChatHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatSessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "extractedData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiChatHistory_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AiChatHistory" ("createdAt", "id", "message", "role") SELECT "createdAt", "id", "message", "role" FROM "AiChatHistory";
DROP TABLE "AiChatHistory";
ALTER TABLE "new_AiChatHistory" RENAME TO "AiChatHistory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
