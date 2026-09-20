// Handles food image uploads (saved in backend/uploads, served at /uploads).
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/AppError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadDir = path.resolve(__dirname, '../../uploads');

const allowed = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${allowed[file.mimetype]}`),
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowed[file.mimetype]) return cb(new AppError('Only JPG, PNG or WebP images are allowed', 400));
    cb(null, true);
  },
}).single('image');
