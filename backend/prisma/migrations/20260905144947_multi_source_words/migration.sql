-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "readingMaterialId" TEXT,
    "screenshotId" TEXT,
    "audioRecordId" TEXT,
    "word" TEXT NOT NULL,
    "contextSentence" TEXT,
    "aiExplanation" TEXT,
    "ankiSyncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavedWord_readingMaterialId_fkey" FOREIGN KEY ("readingMaterialId") REFERENCES "ReadingMaterial" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SavedWord_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "Screenshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SavedWord_audioRecordId_fkey" FOREIGN KEY ("audioRecordId") REFERENCES "AudioRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SavedWord" ("aiExplanation", "ankiSyncStatus", "contextSentence", "createdAt", "id", "readingMaterialId", "updatedAt", "word") SELECT "aiExplanation", "ankiSyncStatus", "contextSentence", "createdAt", "id", "readingMaterialId", "updatedAt", "word" FROM "SavedWord";
DROP TABLE "SavedWord";
ALTER TABLE "new_SavedWord" RENAME TO "SavedWord";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
