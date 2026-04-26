// middlewares/upload.middleware.js
import multer from 'multer';
import fs from 'fs';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only pdf allowed'), false);
};

export const upload = multer({ storage, fileFilter });

