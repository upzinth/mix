import React, { useState, useEffect } from 'react';
import { AudioEditor } from '../AudioEditor/AudioEditor';
import { RevisionChat } from './RevisionChat';
import { Layers, FileAudio, ChevronRight, Share2, Download, History, Folder, Plus, Wand2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export function Dashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get('http://localhost:3001/api/projects', config);
            setProjects(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch projects", error);
            setLoading(false);
        }
    };

    const createProject = async () => {
        const title = prompt("Enter project title:");
        if (!title) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('http://localhost:3001/api/projects', { title, description: 'New Studio Session' }, config);
            fetchProjects();
        } catch (error) {
            alert('Failed to create project');
        }
    };

    const handleTrackUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedProject) return;

        const formData = new FormData();
        formData.append('audio', file);
        formData.append('name', file.name);
        formData.append('type', 'Audio');

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'multipart/form-data' } };

            await axios.post(`http://localhost:3001/api/projects/${selectedProject._id}/tracks`, formData, config);

            // Refresh projects to see the new track
            fetchProjects();

            // Optimistic update (or reload selectedProject from the updated list in next render cycle)
            // Ideally we'd fetch just this project again, but fetchProjects is cheap enough for now
            alert('Track uploaded successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to upload track');
        }
    };

    const handleSeparateStems = async (track, e) => {
        e.stopPropagation();
        if (!selectedProject || !track._id) return;

        const confirm = window.confirm(`Start AI Stem Separation for "${track.name}"?\nThis process may take a minute.`);
        if (!confirm) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.post('http://localhost:3001/api/process/existing', {
                projectId: selectedProject._id,
                trackId: track._id,
                taskType: 'separate',
                options: JSON.stringify({})
            }, config);

            alert('AI Separation started! Track status will update shortly.');
            fetchProjects(); // Refresh to show "Processing" status
        } catch (error) {
            console.error("AI Request Failed", error);
            alert('Failed to start AI processing.');
        }
    };

    return (
        <div className="flex h-[calc(100vh-180px)] bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-900 shadow-4xl animate-in fade-in zoom-in-95 duration-700">
            {/* Sidebar - Project List */}
            <div className="w-72 border-r border-zinc-900 bg-zinc-950/50 flex flex-col">
                <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
                    <h2 className="font-black text-white uppercase tracking-tighter text-lg">My Projects</h2>
                    <Button onClick={createProject} variant="ghost" size="sm" className="p-1 h-auto hover:bg-zinc-800 rounded-full">
                        <Plus size={18} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? <div className="text-center text-zinc-600 text-xs">Loading...</div> : projects.map((project) => (
                        <div
                            key={project._id}
                            onClick={() => { setSelectedProject(project); setSelectedTrack(null); }}
                            className={clsx(
                                "p-3 rounded-xl cursor-pointer transition-all border group",
                                selectedProject?._id === project._id
                                    ? "bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20"
                                    : "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/60 hover:border-zinc-700"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                    selectedProject?._id === project._id ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-500"
                                )}>
                                    <Folder size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{project.title}</p>
                                    <p className="text-[10px] text-zinc-500 mt-0.5">{project.tracks.length} tracks • {new Date(project.updatedAt).toLocaleDateString()}</p>
                                </div>
                                <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-zinc-900/30 border-t border-zinc-900">
                    <Button className="w-full flex items-center gap-2 justify-center py-3">
                        <Layers size={18} />
                        <span>New Session</span>
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
                {selectedTrack ? (
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <div className="p-4 flex items-center gap-2 border-b border-zinc-900">
                            <button onClick={() => setSelectedTrack(null)} className="text-sm text-zinc-500 hover:text-white">← Back to Project</button>
                            <span className="text-zinc-700">/</span>
                            <span className="text-sm font-bold text-white">{selectedTrack.name}</span>
                        </div>
                        <div className="p-8">
                            {/* Note: AudioEditor needs a File object or URL. For now we mock it or need a backend route to stream file */}
                            <AudioEditor file={new File([""], selectedTrack.name)} />

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Download size={18} className="text-amber-500" />
                                        Export Options
                                    </h3>
                                    <div className="space-y-3">
                                        <Button variant="outline" className="w-full justify-between text-xs">
                                            <span>Lossless WAV (24-bit/48kHz)</span>
                                            <span className="text-zinc-500">Free</span>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-between text-xs">
                                            <span>Streaming MP3 (320kbps)</span>
                                            <span className="text-zinc-500">Free</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                                    <h3 className="text-white font-bold mb-4">A/B Comparison</h3>
                                    <div className="flex bg-zinc-950 p-1 rounded-xl">
                                        <button className="flex-1 py-2 text-xs font-bold bg-amber-500 text-black rounded-lg">ORIGINAL</button>
                                        <button className="flex-1 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-300">MASTERED</button>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-4 text-center">
                                        Toggle to hear the sonic difference in real-time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : selectedProject ? (
                    <div className="p-8 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">{selectedProject.title}</h2>
                                <p className="text-zinc-500">{selectedProject.description}</p>
                            </div>
                            <Button className="flex items-center gap-2">
                                <Share2 size={16} />
                                <span>Share Project</span>
                            </Button>
                        </div>

                        {/* Track List for Selected Project */}
                        <div className="flex-1 overflow-y-auto bg-zinc-900/20 rounded-2xl border border-zinc-800/50 p-4 space-y-2">
                            {selectedProject.tracks.length === 0 ? (
                                <div className="text-center py-12 text-zinc-600">No tracks in this project yet. Upload some files!</div>
                            ) : selectedProject.tracks.map((track, idx) => (
                                <div key={idx} onClick={() => setSelectedTrack(track)} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-amber-500 transition-colors">
                                            <FileAudio size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{track.name}</h4>
                                            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md mt-1 inline-block">{track.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={clsx(
                                            "text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider",
                                            track.status === 'Mastered' ? "bg-green-500/20 text-green-400" :
                                                track.status === 'Processing' ? "bg-amber-500/20 text-amber-400" : "bg-zinc-700 text-zinc-400"
                                        )}>
                                            {track.status}
                                        </span>
                                        e.stopPropagation();
                                        if (track.path) {
                                            setSelectedTrack({ ...track, path: track.path });
                                            } else {
                                            setSelectedTrack(track);
                                            }
                                        }}>Open</Button>

                                    <button
                                        onClick={(e) => handleSeparateStems(track, e)}
                                        className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors text-zinc-400 group/btn"
                                        title="AI Separate Stems"
                                    >
                                        <Wand2 size={16} />
                                    </button>
                                </div>
                                </div>
                            ))}
                    </div>
                    </div>
            ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 animate-pulse">
                    <Folder size={40} className="text-zinc-700" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Select a project</h3>
                <p className="text-zinc-500 max-w-sm">Choose one of your projects from the sidebar or create a new one to begin.</p>
            </div>
                )}
        </div>

            {/* Revision Chat Sidepanel */ }
    <RevisionChat />
        </div >
    );
}
