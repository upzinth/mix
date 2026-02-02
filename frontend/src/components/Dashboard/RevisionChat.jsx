import React, { useState } from 'react';
import { Send, Clock, MessageSquare } from 'lucide-react';
import { Button } from '../UI/Button';

export function RevisionChat({ onSeekToTime }) {
    const [message, setMessage] = useState('');
    const [comments, setComments] = useState([
        { id: 1, user: 'Client', text: 'อยากให้เสียงร้องดังขึ้นอีกนิดในช่วงท่อนฮุคครับ', time: '1:20', timestamp: 80, date: '2 mins ago' },
        { id: 2, user: 'Engineer', text: 'รับทราบครับ กำลังปรับ EQ เพิ่มความใสให้ด้วยครับ', time: '1:45', timestamp: 105, date: 'Just now' },
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        const newComment = {
            id: Date.now(),
            user: 'Client',
            text: message,
            time: 'Current', // In real app, get from wavesurfer
            timestamp: 0,
            date: 'Just now'
        };
        setComments([...comments, newComment]);
        setMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 w-80">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-amber-500" />
                <h3 className="font-bold text-white uppercase text-sm tracking-widest">Revision Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="group">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-zinc-400">{comment.user}</span>
                            <span className="text-[10px] text-zinc-600">{comment.date}</span>
                        </div>
                        <div className="bg-zinc-800 rounded-2xl p-3 border border-zinc-700/50 hover:border-amber-500/30 transition-colors">
                            <p className="text-sm text-zinc-200 leading-relaxed">{comment.text}</p>
                            {comment.time && (
                                <button
                                    onClick={() => onSeekToTime && onSeekToTime(comment.timestamp)}
                                    className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-500/80 hover:text-amber-500 font-mono"
                                >
                                    <Clock size={12} />
                                    <span>Pinned to {comment.time}</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <div className="relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a comment..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 pr-12 text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50 resize-none h-24"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute bottom-3 right-3 p-2 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-all active:scale-90"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-[10px] text-zinc-600 mt-2 text-center">
                    Press enter to send or use the icon
                </p>
            </div>
        </div>
    );
}
