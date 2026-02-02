import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import connectDB from './config/db.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import processRoutes from './routes/processRoutes.js';
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
app.use('/api/process', processRoutes);

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

// Audio Processing Task Endpoint (Moved to processRoutes)

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
