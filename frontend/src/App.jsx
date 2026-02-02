import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { FileUpload } from './components/UI/FileUpload';
import { AudioEditor } from './components/AudioEditor/AudioEditor';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Music2, Layers, Cpu, Settings, LayoutDashboard, LogOut, User } from 'lucide-react';
import { clsx } from 'clsx';

function Layout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Helper to determine active tab based on path
    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#0c0c0e] text-zinc-300 p-6 md:p-12">
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-16">
                <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center rotate-3">
                        <Music2 className="text-black" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase">MixStudio <span className="text-amber-500">Pro</span></h1>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link
                        to="/"
                        className={clsx("transition-all", isActive('/') ? "text-amber-500 underline underline-offset-8" : "hover:text-white")}
                    >
                        Editor
                    </Link>
                    <button className="hover:text-white transition-colors">AI Separation</button>
                    <button className="hover:text-white transition-colors">Mixing Serivce</button>
                    <Link
                        to="/dashboard"
                        className={clsx("transition-all flex items-center gap-2", isActive('/dashboard') ? "text-amber-500 underline underline-offset-8" : "hover:text-white")}
                    >
                        <LayoutDashboard size={14} />
                        Dashboard
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-white">
                                <User size={16} className="text-amber-500" />
                                <span>{user.username}</span>
                            </div>
                            <button
                                onClick={() => { logout(); navigate('/login'); }}
                                className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/login" className="px-4 py-2 text-xs font-bold text-white hover:text-amber-500 transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="px-4 py-2 bg-zinc-100 text-black text-xs font-bold rounded-lg hover:bg-white transition-colors">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {children}
            </main>

            <footer className="max-w-6xl mx-auto mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600 uppercase tracking-widest">
                <p>© 2026 Anti Gravity Audio Services</p>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-zinc-400">Terms</a>
                    <a href="#" className="hover:text-zinc-400">Privacy</a>
                    <a href="#" className="hover:text-zinc-400">Security</a>
                </div>
            </footer>
        </div>
    );
}

function EditorPage() {
    const [file, setFile] = useState(null);

    if (file) {
        return (
            <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setFile(null)}
                        className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                        ← Back to Upload
                    </button>
                </div>
                <AudioEditor file={file} />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                    High-End <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-200">Audio Processing</span><br />
                    at Your Fingertips.
                </h2>
                <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
                    Upload your lossless audio files and use our AI-powered engine to separate stems, trim, or prepare for professional mixing.
                </p>
            </div>

            <FileUpload onFileSelect={setFile} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                {[
                    { icon: Layers, title: "AI Stem Separation", desc: "Extract vocals, drums, and instruments with phase-perfect accuracy." },
                    { icon: Cpu, title: "Cloud Processing", desc: "Leverage dedicated Python workers for heavy rendering tasks." },
                    { icon: Music2, title: "Lossless Workflow", desc: "Maintain 24-bit/48kHz quality throughout your entire session." }
                ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
                        <feature.icon className="text-amber-500 mb-4" />
                        <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                        <p className="text-sm text-zinc-500">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <Layout>
                            <EditorPage />
                        </Layout>
                    } />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={
                            <Layout>
                                <Dashboard />
                            </Layout>
                        } />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
