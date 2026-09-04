import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadMedia, listMedia, deleteMedia } from './media.controller';

const router = Router();

import { getDir, diskStorage } from '../../utils/upload';

const uploadScreenshot = multer({ storage: diskStorage('screenshots') });
const uploadAudio = multer({ storage: diskStorage('audio') });

// Screenshots
router.post('/screenshots', uploadScreenshot.single('file'), uploadMedia('screenshots'));
router.get('/screenshots', listMedia('screenshots'));
router.delete('/screenshots/:filename', deleteMedia('screenshots'));

// Audio
router.post('/audio', uploadAudio.single('file'), uploadMedia('audio'));
router.get('/audio', listMedia('audio'));
router.delete('/audio/:filename', deleteMedia('audio'));

export default router;
