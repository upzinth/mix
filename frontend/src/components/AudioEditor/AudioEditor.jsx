import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Play, Pause, Square, ZoomIn, ZoomOut, Scissors, Download } from 'lucide-react';
import { Button } from '../UI/Button';

export function AudioEditor({ file }) {
    const containerRef = useRef(null);
    const wavesurferRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [taskType, setTaskType] = useState('trim'); // 'trim' or 'separate'
    const [zoom, setZoom] = useState(10);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        if (!containerRef.current || !file) return;

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: '#4b4b4b',
            progressColor: '#f59e0b',
            cursorColor: '#f59e0b',
            barRadius: 3,
            height: 120,
            normalize: true,
            plugins: [
                RegionsPlugin.create()
            ]
        });

        // Determine if file is a local File object or a remote URL string
        let url;
        if (typeof file === 'string') {
            // If it's a relative path starting with 'uploads', prepend localhost
            if (file.startsWith('uploads/') || file.startsWith('/uploads/')) {
                url = `http://localhost:3001/${file.replace(/^\//, '')}`;
            } else {
                url = file;
            }
        } else {
            url = URL.createObjectURL(file);
        }

        ws.load(url);
        wavesurferRef.current = ws;

        ws.on('ready', () => {
            setDuration(ws.getDuration());
            // Enable region creation
            const regions = ws.plugins[0];
            regions.addRegion({
                start: 0,
                end: ws.getDuration() / 4,
                color: 'rgba(245, 158, 11, 0.2)',
                drag: true,
                resize: true
            });
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()));

        return () => {
            ws.destroy();
            if (typeof file !== 'string') {
                URL.revokeObjectURL(url);
            }
        };
    }, [file]);

    const togglePlay = useCallback(() => wavesurferRef.current?.playPause(), []);
    const stop = useCallback(() => {
        wavesurferRef.current?.stop();
        setIsPlaying(false);
    }, []);

    const setSource = useCallback((newFile) => {
        if (!wavesurferRef.current || !newFile) return;

        let url;
        if (typeof newFile === 'string') {
            if (newFile.startsWith('uploads/') || newFile.startsWith('/uploads/')) {
                url = `http://localhost:3001/${newFile.replace(/^\//, '')}`;
            } else {
                url = newFile;
            }
        } else {
            url = URL.createObjectURL(newFile);
        }

        const currentTimeBefore = wavesurferRef.current.getCurrentTime();
        wavesurferRef.current.load(url);
        wavesurferRef.current.once('ready', () => {
            wavesurferRef.current.setTime(currentTimeBefore);
            if (isPlaying) wavesurferRef.current.play();
        });
    }, [isPlaying]);

    const handleZoom = (val) => {
        const newZoom = Math.max(1, Math.min(100, val));
        setZoom(newZoom);
        wavesurferRef.current?.zoom(newZoom);
    };

    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        const ms = Math.floor((time % 1) * 100);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {typeof file === 'string' ? file.split('/').pop() : file.name}
                    </h2>
                    <p className="text-zinc-500 font-mono text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleZoom(zoom - 5)}>
                        <ZoomOut size={18} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZoom(zoom + 5)}>
                        <ZoomIn size={18} />
                    </Button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="w-full bg-zinc-800/30 rounded-xl mb-8 overflow-hidden min-h-[120px]"
            />

            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        className="w-14 h-14 rounded-full flex items-center justify-center p-0"
                        onClick={togglePlay}
                    >
                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-12 h-12 rounded-full flex items-center justify-center p-0"
                        onClick={stop}
                    >
                        <Square size={20} fill="currentColor" />
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-800 p-1 rounded-xl mr-2">
                        <button
                            onClick={() => setTaskType('trim')}
                            className={clsx(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                taskType === 'trim' ? "bg-amber-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            TRIM
                        </button>
                        <button
                            onClick={() => setTaskType('separate')}
                            className={clsx(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                taskType === 'separate' ? "bg-amber-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            AI SEPARATE
                        </button>
                    </div>

                    <Button
                        variant="primary"
                        className="flex items-center gap-2 min-w-[160px] justify-center"
                        disabled={isProcessing}
                        onClick={async () => {
                            setIsProcessing(true);
                            const formData = new FormData();
                            formData.append('audio', file);
                            formData.append('taskType', taskType);

                            const region = wavesurferRef.current?.plugins[0].regions[0];
                            formData.append('options', JSON.stringify({
                                start: region?.start || 0,
                                end: region?.end || 10
                            }));

                            try {
                                const response = await fetch('http://localhost:3001/api/process', {
                                    method: 'POST',
                                    body: formData
                                });
                                const data = await response.json();
                                console.log('Result:', data);
                                if (data.status === 'completed') {
                                    alert(`Processing Complete! Job ID: ${data.jobId}`);
                                } else {
                                    alert(`Job Queued: ${data.message}`);
                                }
                            } catch (e) {
                                alert('Failed to connect to backend: ' + e.message);
                            } finally {
                                setIsProcessing(false);
                            }
                        }}
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <>
                                <Download size={18} />
                                <span>{taskType === 'trim' ? 'Process & Export' : 'Separate Stems'}</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="mt-8 p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                <p className="text-amber-500/80 text-sm flex items-start gap-2">
                    <span className="font-bold">Pro Tip:</span>
                    Drag the handles on the highlighted area to select the portion of audio you want to process or cut.
                </p>
            </div>
        </div>
    );
}
