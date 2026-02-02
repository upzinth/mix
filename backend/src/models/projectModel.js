import mongoose from 'mongoose';

const trackSchema = mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    type: { type: String, default: 'Audio' }, // Vocal, Drums, etc.
    size: { type: String },
    status: {
        type: String,
        enum: ['Raw', 'Processing', 'Mastered'],
        default: 'Raw'
    },
});

const projectSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Active', 'Archived', 'Completed'],
        default: 'Active',
    },
    tracks: [trackSchema],
    description: {
        type: String,
    }
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
