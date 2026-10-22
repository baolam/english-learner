import { Request, Response } from 'express';
import * as settingService from './setting.service';
import { broadcastSSE } from '../../utils/sse';
import { asyncHandler } from '../../utils/async-handler';

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingService.getSettings();
  res.status(200).json(settings);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const updated = await settingService.updateSettings(req.body);
  broadcastSSE('SETTINGS_UPDATED', updated);
  res.status(200).json(updated);
});
