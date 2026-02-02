import React, { useRef } from 'react';
import { Upload, Music } from 'lucide-react';

export function FileUpload({ onFileSelect }) {
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            onFileSelect(files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-amber-500/50 transition-all rounded-2xl p-12 text-center cursor-pointer group"
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="text-amber-500" />
                </div>
                <div>
                    <h3 className="text-xl font-medium text-white">Upload Audio File</h3>
                    <p className="text-zinc-400 mt-2">
                        Drag and drop your .wav or .mp3 here, or click to browse
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800/80 px-3 py-1 rounded-full mt-4">
                    <Music size={14} />
                    <span>Lossless WAV recommended</span>
                </div>
            </div>
        </div>
    );
}
