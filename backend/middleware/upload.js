import multer from 'multer';
import { cloudinaryStorage } from '../config/cloudinary.js';

const upload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images, videos, and PDFs are allowed'));
    }
  },
});

export default upload;
