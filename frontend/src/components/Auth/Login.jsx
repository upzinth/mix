import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../UI/Button';
import { Music2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c0c0e] text-zinc-300 p-6">
            <div className="w-full max-w-md bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center rotate-3 mx-auto mb-4">
                        <Music2 className="text-black" size={24} />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Welcome <span className="text-amber-500">Back</span></h1>
                    <p className="text-zinc-500 text-sm mt-2">Sign in to access your dashboard</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-xs text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <Button type="submit" variant="primary" className="w-full justify-center py-3 mt-4">
                        Sign In
                    </Button>
                </form>

                <p className="text-center text-xs text-zinc-500 mt-8">
                    Don't have an account? <Link to="/register" className="text-amber-500 hover:underline">Register now</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
