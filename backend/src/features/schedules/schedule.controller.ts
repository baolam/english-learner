import { Request, Response } from 'express';
import { ScheduleService } from './schedule.service';

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await ScheduleService.getSchedules();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await ScheduleService.createSchedule(req.body);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schedule = await ScheduleService.updateSchedule(id, req.body);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await ScheduleService.deleteSchedule(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};
