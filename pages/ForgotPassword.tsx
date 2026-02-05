
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const { resetPassword } = useAppStore(); // We need to add this to store
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const result = await resetPassword(email);
            if (result.success) {
                setStatus('success');
                setMessage(result.message || 'If an account exists, a reset link has been sent.');
            } else {
                setStatus('error');
                setMessage(result.message || 'Failed to reset password.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('An unexpected error occurred.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-6">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <div className="mb-8">
                    <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-6">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Login
                    </Link>

                    <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-200">
                        <KeyRound size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot Password?</h1>
                    <p className="text-slate-500 mt-2">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-green-900 mb-2">Check your email</h3>
                        <p className="text-green-700 text-sm mb-6">
                            {message}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase px-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <p className="text-red-500 text-sm px-1 text-center bg-red-50 py-2 rounded-lg border border-red-100">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {status === 'loading' ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
