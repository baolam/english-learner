import cron from 'node-cron';
import { prisma } from '../prisma';
import { NotificationService } from '../../features/notifications/notification.service';
import { NotificationType } from '@english-learner/types';

// Reminder checkpoints, in minutes-before-start, most urgent last.
const THRESHOLDS = [15, 5, 0];

const runScheduleReminderJob = async () => {
  try {
    const now = new Date();
    const lookAheadTime = new Date(now.getTime() + 16 * 60000);
    // Small grace window so a reminder near/at start time still fires even if
    // the backend was offline for a bit and only just came back up.
    const graceCutoff = new Date(now.getTime() - 5 * 60000);

    const candidateSchedules = await prisma.schedule.findMany({
      where: {
        startTime: {
          gte: graceCutoff,
          lte: lookAheadTime,
        },
        isCompleted: false,
      }
    });

    for (const schedule of candidateSchedules) {
      const diffMs = schedule.startTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      // Current urgency level: the largest threshold that has already been
      // crossed (diffMins <= threshold). Thresholds are checked in order so
      // the first match is the biggest (least urgent) one still applicable.
      const currentThreshold = THRESHOLDS.find((t) => diffMins <= t);
      if (currentThreshold === undefined) continue;

      const alreadySent = schedule.lastReminderThreshold;
      const isMoreUrgentThanLastSent = alreadySent === null || currentThreshold < alreadySent;
      if (!isMoreUrgentThanLastSent) continue;

      await NotificationService.createNotification(
        `Nhắc nhở: ${schedule.title}`,
        `Lịch học "${schedule.title}" sẽ bắt đầu ${diffMins <= 0 ? 'ngay bây giờ' : `trong ${diffMins} phút nữa`}.`,
        NotificationType.REMINDER
      );

      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { lastReminderThreshold: currentThreshold }
      });
    }
  } catch (error) {
    console.error('[CRON] Error running schedule reminder job:', error);
  }
};

export const startScheduleCron = () => {
  // Catch-up: this app isn't always running, so check immediately on startup
  // instead of only waiting for the next minute tick.
  runScheduleReminderJob();

  // Run every minute while the process stays up.
  cron.schedule('* * * * *', runScheduleReminderJob);
};
