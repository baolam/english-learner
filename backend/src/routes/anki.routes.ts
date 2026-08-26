import { Router } from 'express';
import { getMediaFile, getDashboardStats, addNote } from '../controllers/anki.controller';

const router = Router();

router.get('/media/:filename', getMediaFile);
router.get('/dashboard', getDashboardStats);
router.post('/add-note', addNote);

export default router;
