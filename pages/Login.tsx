
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Lock, LogIn } from 'lucide-react';

const Login: React.FC = () => {
    const { login, state } = useAppStore();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // If no business exists, they should probably signup first.
    // Although ProtectedLayout redirects to /signup if no business.

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = login(password);
        if (success) {
            navigate('/');
        } else {
            setError('Incorrect password');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-6">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <div className="text-center mb-8">
                    <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">
                        {state.business?.name ? `Log in to ${state.business.name}` : 'Login to your dashboard'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase px-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm px-1 pt-1">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all mt-4"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
