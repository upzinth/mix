import Project from '../models/projectModel.js';

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        res.status(400).json({ message: 'Please add a title' });
        return;
    }

    try {
        const project = await Project.create({
            user: req.user._id,
            title,
            description,
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a track to a project
// @route   POST /api/projects/:id/tracks
// @access  Private
const addTrack = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        if (project.user.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        const { name, path, type, size } = req.body;

        const newTrack = {
            name,
            path,
            type,
            size
        };

        project.tracks.push(newTrack);
        await project.save();

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getProjects, createProject, addTrack };
