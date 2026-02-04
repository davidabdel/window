
import React, { useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Settings,
  Plus,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from './store';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CustomerList from './pages/CustomerList';
import CustomerForm from './pages/CustomerForm';
import QuoteList from './pages/QuoteList';
import QuoteForm from './pages/QuoteForm';
import JobList from './pages/JobList';
import JobForm from './pages/JobForm';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsView';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, isAuthenticated } = useAppStore();
  const location = useLocation();

  if (!state.business) {
    return <Navigate to="/signup" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Customers', icon: Users, path: '/customers' },
    { label: 'Quotes', icon: FileText, path: '/quotes' },
    { label: 'Jobs', icon: Briefcase, path: '/jobs' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900 truncate">
          {state.business.name}
        </h1>
        <div className="flex items-center gap-2">
          {/* Header actions could go here */}
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 flex justify-around items-center pb-safe shadow-lg z-40">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'
                }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/customers" element={<ProtectedLayout><CustomerList /></ProtectedLayout>} />
        <Route path="/customers/new" element={<ProtectedLayout><CustomerForm /></ProtectedLayout>} />
        <Route path="/customers/:id" element={<ProtectedLayout><CustomerForm /></ProtectedLayout>} />

        <Route path="/quotes" element={<ProtectedLayout><QuoteList /></ProtectedLayout>} />
        <Route path="/quotes/new" element={<ProtectedLayout><QuoteForm /></ProtectedLayout>} />
        <Route path="/quotes/:id" element={<ProtectedLayout><QuoteForm /></ProtectedLayout>} />

        <Route path="/jobs" element={<ProtectedLayout><JobList /></ProtectedLayout>} />
        <Route path="/jobs/new" element={<ProtectedLayout><JobForm /></ProtectedLayout>} />
        <Route path="/jobs/:id" element={<ProtectedLayout><JobForm /></ProtectedLayout>} />

        <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />

        {/* Catch all - redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
