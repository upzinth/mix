import express from 'express';
import { processUpload, processExistingTrack } from '../controllers/processController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const upload = multer({ dest: 'uploads/' }); // Simple config, or import the robust one

const router = express.Router();

router.post('/', upload.single('audio'), processUpload);
router.post('/existing', protect, processExistingTrack);

export default router;
