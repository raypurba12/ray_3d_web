import fs from 'fs';
import path from 'path';

const apiRoot = path.resolve(__dirname, '../..');

export const getUploadsDir = (): string => {
  const configured = process.env.UPLOAD_DIR || 'uploads';
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(apiRoot, configured);
};

export const ensureUploadsDir = (): string => {
  const dir = getUploadsDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};
