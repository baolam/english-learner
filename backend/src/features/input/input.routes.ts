import { Router } from 'express';
import multer from 'multer';
import { handleScreenUpload, handleSoundUpload, handleTextUpload } from './input.controller';

import { diskStorage } from '../../utils/upload';

const router = Router();
const uploadText = multer({ storage: multer.memoryStorage() });
const uploadScreen = multer({ storage: diskStorage('screenshots') });
const uploadSound = multer({ storage: diskStorage('audio') });

router.post('/screen', uploadScreen.single('file'), handleScreenUpload);
router.post('/sound', uploadSound.single('file'), handleSoundUpload);
router.post('/text', uploadText.single('file'), handleTextUpload);

export default router;
