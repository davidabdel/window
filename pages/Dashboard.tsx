
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

      <section className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-200">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Business Pulse</h3>
            <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Performance</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase">FY Ending June 30</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* Active Customers */}
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Clients</p>
            <p className="text-xl font-bold text-white">{state.customers.length}</p>
          </div>

          {/* YTD Invoiced - Highlighted */}
          <div className="space-y-1 col-span-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 -mx-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">YTD Invoiced</p>
              <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/50">Fiscal Year</span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">
              ${state.jobs
                .filter(j => j.status === 'completed' && j.completedAt)
                .reduce((sum, j) => {
                  const now = new Date();
                  const startYear = now.getMonth() < 6 ? now.getFullYear() - 1 : now.getFullYear();
                  const startOfFY = new Date(startYear, 6, 1);
                  const completedDate = new Date(j.completedAt!);
                  if (completedDate >= startOfFY && completedDate <= now) return sum + (j.price || 0);
                  return sum;
                }, 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Pending Quotes Value */}
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Quotes</p>
            <p className="text-lg font-bold text-indigo-300">
              ${state.quotes
                .filter(q => q.status === 'draft' || q.status === 'needs-follow-up')
                .reduce((sum, q) => sum + q.amount, 0).toLocaleString()}
            </p>
          </div>

          {/* Future Jobs Value */}
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Future Revenue</p>
            <p className="text-lg font-bold text-blue-300">
              ${state.jobs
                .filter(j => j.status === 'scheduled' && new Date(j.scheduledDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
                .reduce((sum, j) => sum + j.price, 0).toLocaleString()}
            </p>
          </div>

          {/* Future Jobs Count */}
          <div className="space-y-1 pt-2 border-t border-slate-800 col-span-2 flex items-center justify-between">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Booked Jobs (Upcoming)</p>
            <p className="text-sm font-bold text-white">
              {state.jobs.filter(j => j.status === 'scheduled' && new Date(j.scheduledDate) >= new Date(new Date().setHours(0, 0, 0, 0))).length}
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Dashboard;
