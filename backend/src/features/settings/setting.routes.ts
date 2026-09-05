import { Router } from 'express';
import * as settingController from './setting.controller';

const router = Router();

router.get('/', settingController.getSettings);
router.put('/', settingController.updateSettings);

export default router;
