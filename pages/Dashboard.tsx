
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Calendar, 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store';

const Dashboard: React.FC = () => {
  const { state } = useAppStore();
  
  const alerts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const jobsDueToday = state.jobs.filter(j => 
      j.status === 'scheduled' && j.scheduledDate.startsWith(today)
    );
    
    const followUpQuotes = state.quotes.filter(q => 
      q.status === 'needs-follow-up'
    );
    
    return {
      jobsDueToday,
      followUpQuotes
    };
  }, [state.jobs, state.quotes]);

  const tiles = [
    { label: 'New Quote', icon: FileText, color: 'bg-indigo-50 text-indigo-600', path: '/quotes/new', sub: 'Create estimate' },
    { label: 'New Job', icon: PlusCircle, color: 'bg-emerald-50 text-emerald-600', path: '/jobs/new', sub: 'Schedule work' },
    { label: 'Customers', icon: Users, color: 'bg-blue-50 text-blue-600', path: '/customers', sub: 'Manage clients' },
    { label: 'Jobs List', icon: Calendar, color: 'bg-amber-50 text-amber-600', path: '/jobs', sub: 'View schedule' },
  ];

  return (
    <div className="p-4 space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link 
                key={tile.path}
                to={tile.path}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center active:scale-95 transition-transform"
              >
                <div className={`p-3 rounded-xl ${tile.color} mb-3`}>
                  <Icon size={24} />
                </div>
                <span className="font-bold text-slate-900 block">{tile.label}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase mt-1">{tile.sub}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Daily Priorities</h2>
        
        {alerts.jobsDueToday.length > 0 && (
          <Link 
            to="/jobs?view=today" 
            className="flex items-center gap-4 bg-amber-50 border border-amber-100 p-4 rounded-2xl active:bg-amber-100 transition-colors"
          >
            <div className="bg-amber-500 text-white p-2 rounded-lg">
              <Calendar size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-900">{alerts.jobsDueToday.length} Jobs Today</p>
              <p className="text-sm text-amber-700">Don't forget to pack the ladder!</p>
            </div>
            <ChevronRight className="text-amber-400" size={20} />
          </Link>
        )}

        {alerts.followUpQuotes.length > 0 && (
          <Link 
            to="/quotes?status=needs-follow-up" 
            className="flex items-center gap-4 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl active:bg-indigo-100 transition-colors"
          >
            <div className="bg-indigo-500 text-white p-2 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-indigo-900">{alerts.followUpQuotes.length} Quotes to Follow Up</p>
              <p className="text-sm text-indigo-700">Chase these to get more work.</p>
            </div>
            <ChevronRight className="text-indigo-400" size={20} />
          </Link>
        )}

        {alerts.jobsDueToday.length === 0 && alerts.followUpQuotes.length === 0 && (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <p className="font-bold text-slate-900">All caught up!</p>
            <p className="text-sm text-slate-500">No urgent alerts for today.</p>
          </div>
        )}
      </section>

      <section className="bg-slate-900 p-6 rounded-2xl text-white">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Business Summary</h3>
        <p className="text-2xl font-bold mb-4">You're doing great!</p>
        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Active Customers</p>
            <p className="text-lg font-bold">{state.customers.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Pending Quotes</p>
            <p className="text-lg font-bold">
              ${state.quotes.filter(q => q.status !== 'accepted').reduce((sum, q) => sum + q.amount, 0)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
