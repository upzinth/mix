import express from 'express';
import { getProjects, createProject, addTrack } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

// Configure Multer (duplicate config from index.js - ideally should be in a separate config file)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

const router = express.Router();

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id/tracks').post(protect, upload.single('audio'), addTrack);

export default router;
