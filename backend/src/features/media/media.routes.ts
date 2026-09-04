import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadMedia, listMedia, deleteMedia } from './media.controller';

const router = Router();

const getDir = (type: 'screenshots' | 'audio') => {
  const envKey = type === 'screenshots' ? 'SCREENSHOTS_UPLOAD_DIR' : 'AUDIO_UPLOAD_DIR';
  const defaultDir = `./uploads/${type}`;
  const dirPath = process.env[envKey] || defaultDir;
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

const storage = (type: 'screenshots' | 'audio') => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getDir(type));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${type}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadScreenshot = multer({ storage: storage('screenshots') });
const uploadAudio = multer({ storage: storage('audio') });

// Screenshots
router.post('/screenshots', uploadScreenshot.single('file'), uploadMedia('screenshots'));
router.get('/screenshots', listMedia('screenshots'));
router.delete('/screenshots/:filename', deleteMedia('screenshots'));

// Audio
router.post('/audio', uploadAudio.single('file'), uploadMedia('audio'));
router.get('/audio', listMedia('audio'));
router.delete('/audio/:filename', deleteMedia('audio'));

export default router;
