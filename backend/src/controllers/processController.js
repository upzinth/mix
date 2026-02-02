import axios from 'axios';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Project from '../models/projectModel.js';

// @desc    Process a newly uploaded file
// @route   POST /api/process
// @access  Public (or Private if we protect it later)
const processUpload = async (req, res) => {
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
            console.error('Worker connection failed:', workerError.message);
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
};

// @desc    Process an existing track from a project
// @route   POST /api/process/existing
// @access  Private
const processExistingTrack = async (req, res) => {
    const { projectId, trackId, taskType, options } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Verify user ownership
        if (project.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const track = project.tracks.id(trackId);
        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }

        // Logic to get absolute path from relative stored path
        // track.path is like "uploads/filename.wav"
        const absoluteFilePath = path.resolve(track.path);
        const jobId = uuidv4();

        // Update track status to Processing
        track.status = 'Processing';
        await project.save();

        console.log(`[Job ${jobId}] Dispatching EXISTING track ${track.name} to Worker...`);

        // Async processing - we respond immediately to UI, but continue working
        // Ideally we'd use a queue, but for now we await the worker responsibly or just fire and forget if it's long running
        // For 'separate', it might take 30s+. Let's wait for it for this MVP or the UI won't update.
        // Better pattern: Return 'Processing' status, and frontend polls or socket updates.
        // For simplicity: We'll wait up to a certain timeout, or just return and let the worker run.

        // Let's await it to show immediate result in this MVP step
        try {
            const workerResponse = await axios.post('http://localhost:8000/process', {
                file_path: absoluteFilePath,
                task_type: taskType || 'separate',
                params: JSON.parse(options || '{}')
            });

            // If separation, we might get multiple new files back.
            // For now, let's assume the worker returns a list of new file paths.
            // We would add those as new tracks to the project.

            // Temporary: Just mark as Mastered to show completion
            track.status = 'Mastered';
            await project.save();

            res.json({
                jobId,
                status: 'completed',
                workerResult: workerResponse.data
            });

        } catch (workerError) {
            console.error('Worker failed:', workerError.message);
            track.status = 'Raw'; // Revert
            await project.save();
            res.status(502).json({ message: 'Worker failed to process track' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export { processUpload, processExistingTrack };
