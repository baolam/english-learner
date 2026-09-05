import { Request, Response } from 'express';
import * as settingService from './setting.service';
import { broadcastSSE } from '../../utils/sse';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingService.getSettings();
    res.status(200).json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updated = await settingService.updateSettings(req.body);
    broadcastSSE('SETTINGS_UPDATED', updated);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
