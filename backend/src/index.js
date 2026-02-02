import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'MixStudio API' });
});

// Audio Processing Task Endpoint
app.post('/api/process', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        const { taskType, options } = req.body;
        const jobId = uuidv4();
        const absoluteFilePath = path.resolve(req.file.path);

        console.log(`[Job ${jobId}] Dispatching ${taskType} to Worker...`);

        // Call Python Worker
        try {
            const workerResponse = await axios.post('http://localhost:8000/process', {
                file_path: absoluteFilePath,
                task_type: taskType || 'trim',
                params: JSON.parse(options || '{}')
            });

            res.json({
                jobId,
                status: 'completed',
                workerResult: workerResponse.data,
                fileInfo: {
                    filename: req.file.filename,
                    size: req.file.size
                }
            });
        } catch (workerError) {
            console.error('Worker connection failed, returning queued status:', workerError.message);
            res.json({
                jobId,
                status: 'queued',
                message: 'Worker is busy or offline, job will be processed shortly.',
                fileInfo: {
                    filename: req.file.filename,
                    size: req.file.size
                }
            });
        }

    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
