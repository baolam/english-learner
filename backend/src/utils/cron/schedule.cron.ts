import cron from 'node-cron';
import { prisma } from '../prisma';
import { NotificationService } from '../../features/notifications/notification.service';

export const startScheduleCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Look ahead 16 minutes just in case
      const lookAheadTime = new Date(now.getTime() + 16 * 60000); 

      const upcomingSchedules = await prisma.schedule.findMany({
        where: {
          startTime: {
            gte: now,
            lte: lookAheadTime,
          },
          isCompleted: false,
        }
      });

      for (const schedule of upcomingSchedules) {
        const diffMs = schedule.startTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        // Send notifications at 15 mins, 5 mins, and right on time (0 mins)
        if (diffMins === 15 || diffMins === 5 || diffMins === 0) {
           await NotificationService.createNotification(
             `Nhắc nhở: ${schedule.title}`,
             `Lịch học "${schedule.title}" sẽ bắt đầu ${diffMins === 0 ? 'ngay bây giờ' : `trong ${diffMins} phút nữa`}.`,
             'REMINDER'
           );
        }
      }
    } catch (error) {
      console.error('[CRON] Error running schedule cron job:', error);
    }
  });
};
