import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const getDir = (type: 'screenshots' | 'audio') => {
  const envKey = type === 'screenshots' ? 'SCREENSHOTS_UPLOAD_DIR' : 'AUDIO_UPLOAD_DIR';
  const defaultDir = `./uploads/${type}`;
  const dirPath = process.env[envKey] || defaultDir;
  const resolvedDir = path.resolve(dirPath);
  
  if (!fs.existsSync(resolvedDir)) {
    fs.mkdirSync(resolvedDir, { recursive: true });
  }
  return resolvedDir;
};

export const diskStorage = (type: 'screenshots' | 'audio') => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getDir(type));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${type}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
