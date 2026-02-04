
import React from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    ShieldCheck,
    TrendingUp,
    CalendarDays,
    CheckCircle2,
    ArrowRight,
    Menu,
    X
} from 'lucide-react';

const Landing: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-xl">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">windowrun</span>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <Link to="/login" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                                <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-500/25">
                                    Get Started
                                </Link>
                            </div>
                        </div>

                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-slate-900 border-b border-slate-800">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Login</Link>
                            <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:text-blue-300 font-bold">Get Started</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none opacity-40">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-sm font-medium text-slate-300">The #1 Platform for Solo Cleaners</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Run your window cleaning <br className="hidden md:block" />
                        business <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">on autopilot.</span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400 mb-10">
                        Ditch the paperwork. Handle quotes, scheduling, invoicing, and customer management in one simple app designed for solo operators.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/signup" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-500/20">
                            Start Free Trial <ArrowRight className="ml-2" size={20} />
                        </Link>
                        <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 border border-slate-700 text-lg font-medium rounded-xl text-slate-300 bg-slate-800/50 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-sm">
                            Log In
                        </Link>
                    </div>

                    {/* Hero Image / Dashboard Preview */}
                    <div className="mt-20 relative rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl overflow-hidden max-w-5xl mx-auto group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 z-10 pointer-events-none"></div>
                        {/* Abstract representation of dashboard */}
                        <div className="p-4 grid grid-cols-12 gap-4 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                            {/* Sidebar */}
                            <div className="col-span-1 hidden md:flex flex-col gap-4 py-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
                                <div className="w-8 h-8 rounded-lg bg-slate-800/50"></div>
                                <div className="w-8 h-8 rounded-lg bg-slate-800/50"></div>
                                <div className="w-8 h-8 rounded-lg bg-slate-800/50"></div>
                            </div>

                            {/* Main Content */}
                            <div className="col-span-12 md:col-span-11 bg-slate-950 rounded-xl p-6 border border-slate-800/50 min-h-[400px]">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="h-4 w-32 bg-slate-800 rounded"></div>
                                    <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="h-24 bg-slate-900 rounded-xl border border-slate-800 p-4">
                                        <div className="h-8 w-8 bg-blue-500/10 rounded-lg mb-2"></div>
                                        <div className="h-3 w-16 bg-slate-800 rounded"></div>
                                    </div>
                                    <div className="h-24 bg-slate-900 rounded-xl border border-slate-800 p-4">
                                        <div className="h-8 w-8 bg-purple-500/10 rounded-lg mb-2"></div>
                                        <div className="h-3 w-16 bg-slate-800 rounded"></div>
                                    </div>
                                    <div className="h-24 bg-slate-900 rounded-xl border border-slate-800 p-4">
                                        <div className="h-8 w-8 bg-green-500/10 rounded-lg mb-2"></div>
                                        <div className="h-3 w-16 bg-slate-800 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-12 w-full bg-slate-900 rounded-lg border border-slate-800"></div>
                                    <div className="h-12 w-full bg-slate-900 rounded-lg border border-slate-800"></div>
                                    <div className="h-12 w-full bg-slate-900 rounded-lg border border-slate-800"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-slate-950 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to grow</h2>
                        <p className="mt-4 text-lg text-slate-400">Professional tools built specifically for the window cleaning industry.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 hover:border-slate-700 transition-all">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6">
                                <CalendarDays className="text-blue-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Smart Scheduling</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Organize your jobs with a drag-and-drop calendar. Never miss an appointment or double-book yourself again.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 hover:border-slate-700 transition-all">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck className="text-purple-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Client Management</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Keep track of customer details, preferences, and history. Build trust and retain more clients with ease.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 hover:border-slate-700 transition-all">
                            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-6">
                                <TrendingUp className="text-green-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Instant Quoting</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Send professional quotes in seconds. Let clients accept online and convert them to jobs instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Proof / Trust */}
            <div className="py-20 border-y border-slate-800 bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-slate-500 tracking-wider uppercase mb-8">Trusted by professional window cleaners</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos */}
                        <div className="flex items-center justify-center text-xl font-bold text-slate-300">CleanPane</div>
                        <div className="flex items-center justify-center text-xl font-bold text-slate-300">SkyReach</div>
                        <div className="flex items-center justify-center text-xl font-bold text-slate-300">ClearView</div>
                        <div className="flex items-center justify-center text-xl font-bold text-slate-300">ShinePro</div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 z-0"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to streamline your business?</h2>
                    <p className="text-xl text-slate-400 mb-10">Join other solo window cleaning professionals who are saving 10+ hours a week.</p>
                    <Link to="/signup" className="inline-block bg-white text-blue-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl">
                        Get Started for Free
                    </Link>
                    <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> No credit card required
                        <span className="mx-2">•</span>
                        <CheckCircle2 size={16} /> Cancel anytime
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-950 border-t border-slate-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600/20 p-1.5 rounded-lg">
                            <Sparkles size={18} className="text-blue-500" />
                        </div>
                        <span className="font-bold text-lg text-slate-200">windowrun</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} windowrun using Solo Window Cleaning Hub technology.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
