import { Request, Response } from 'express';
import { ScheduleService } from './schedule.service';
import { asyncHandler } from '../../utils/async-handler';
import { NotFoundError } from '../../errors/app-error';

export const getSchedules = asyncHandler(async (req: Request, res: Response) => {
  const schedules = await ScheduleService.getSchedules();
  res.json(schedules);
});

export const getScheduleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const schedule = await ScheduleService.getScheduleById(id);
  if (!schedule) {
    throw new NotFoundError('Schedule not found');
  }
  res.json(schedule);
});

export const createSchedule = asyncHandler(async (req: Request, res: Response) => {
  const schedule = await ScheduleService.createSchedule(req.body);
  res.json(schedule);
});

export const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const schedule = await ScheduleService.updateSchedule(id, req.body);
  res.json(schedule);
});

export const deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ScheduleService.deleteSchedule(id);
  res.json({ success: true });
});
