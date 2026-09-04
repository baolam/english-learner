import { prisma } from '../../utils/prisma';

export class ScheduleService {
  static async createSchedule(data: { title: string; description?: string; startTime: Date; endTime: Date }) {
    return prisma.schedule.create({
      data: {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime)
      }
    });
  }

  static async getSchedules() {
    return prisma.schedule.findMany({
      orderBy: { startTime: 'asc' }
    });
  }

  static async updateSchedule(id: string, data: any) {
    if (data.startTime) data.startTime = new Date(data.startTime);
    if (data.endTime) data.endTime = new Date(data.endTime);
    
    return prisma.schedule.update({
      where: { id },
      data
    });
  }

  static async deleteSchedule(id: string) {
    return prisma.schedule.delete({
      where: { id }
    });
  }

  static async markCompleted(id: string) {
    return prisma.schedule.update({
      where: { id },
      data: { isCompleted: true }
    });
  }
}
