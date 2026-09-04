import { Router } from 'express';
import multer from 'multer';
import { handleScreenUpload, handleSoundUpload, handleTextUpload } from './input.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/screen', upload.single('file'), handleScreenUpload);
router.post('/sound', upload.single('file'), handleSoundUpload);
router.post('/text', upload.single('file'), handleTextUpload);

export default router;
