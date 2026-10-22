import cron from 'node-cron';
import path from 'path';
import fs from 'fs';
import { prisma } from '../prisma';
import { getDir } from '../upload';

const runCleanupJob = async () => {
  console.log('[CRON] Starting orphaned media cleanup job...');
  try {
    const retentionCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // 1. Cleanup orphaned Screenshots
    const orphanedScreenshots = await prisma.screenshot.findMany({
      where: {
        sessionId: null,
        terms: { none: {} },
        chatSessions: { none: {} },
        createdAt: { lte: retentionCutoff }
      }
    });

    const screenshotDir = getDir('screenshots');
    for (const ss of orphanedScreenshots) {
      const filePath = path.join(screenshotDir, ss.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (orphanedScreenshots.length > 0) {
      await prisma.screenshot.deleteMany({
        where: {
          id: { in: orphanedScreenshots.map((s) => s.id) }
        }
      });
      console.log(`[CRON] Cleaned up ${orphanedScreenshots.length} orphaned screenshots.`);
    }

    // 2. Cleanup orphaned AudioRecords
    const orphanedAudio = await prisma.audioRecord.findMany({
      where: {
        sessionId: null,
        terms: { none: {} },
        chatSessions: { none: {} },
        createdAt: { lte: retentionCutoff }
      }
    });

    const audioDir = getDir('audio');
    for (const audio of orphanedAudio) {
      const filePath = path.join(audioDir, audio.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (orphanedAudio.length > 0) {
      await prisma.audioRecord.deleteMany({
        where: {
          id: { in: orphanedAudio.map((a) => a.id) }
        }
      });
      console.log(`[CRON] Cleaned up ${orphanedAudio.length} orphaned audio records.`);
    }
  } catch (error) {
    console.error('[CRON] Error running media cleanup job:', error);
  }
};

export const startCleanupCron = () => {
  // Catch-up: this app is rarely alive at 3 AM on a personal laptop, so run
  // once shortly after every startup instead of relying solely on the fixed
  // schedule below. Delayed slightly so it doesn't compete with server boot.
  setTimeout(runCleanupJob, 10_000);

  // Run daily at 3:00 AM too, for the rare case the process is long-lived.
  cron.schedule('0 3 * * *', runCleanupJob);
};
