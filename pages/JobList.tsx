
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Calendar, CheckCircle, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useAppStore } from '../store';

const JobList: React.FC = () => {
  const { state } = useAppStore();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  
  const viewFilter = searchParams.get('view') || 'all';

  const filtered = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    return state.jobs.filter(j => {
      const customer = state.customers.find(c => c.id === j.customerId);
      const matchesSearch = customer?.name.toLowerCase().includes(search.toLowerCase()) || 
                            j.description.toLowerCase().includes(search.toLowerCase());
      
      let matchesView = true;
      if (viewFilter === 'today') matchesView = j.scheduledDate.startsWith(todayStr) && j.status === 'scheduled';
      if (viewFilter === 'upcoming') matchesView = j.scheduledDate > todayStr && j.status === 'scheduled';
      if (viewFilter === 'completed') matchesView = j.status === 'completed';
      
      return matchesSearch && matchesView;
    }).sort((a, b) => {
      if (viewFilter === 'completed') return new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime();
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });
  }, [state.jobs, state.customers, search, viewFilter]);

  const tabs = [
    { label: 'All', id: 'all' },
    { label: 'Today', id: 'today' },
    { label: 'Upcoming', id: 'upcoming' },
    { label: 'Done', id: 'completed' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        <Link 
          to="/jobs/new" 
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-100"
        >
          <Plus size={24} />
        </Link>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto gap-1">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to={`/jobs?view=${tab.id}`}
            className={`flex-1 min-w-[70px] py-2 text-[11px] font-bold uppercase text-center rounded-lg transition-all ${
              viewFilter === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Search jobs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(job => {
            const customer = state.customers.find(c => c.id === job.customerId);
            const date = new Date(job.scheduledDate);
            const isCompleted = job.status === 'completed';

            return (
              <Link 
                key={job.id} 
                to={`/jobs/${job.id}`}
                className={`block bg-white border p-4 rounded-2xl active:bg-slate-50 transition-colors shadow-sm ${
                  isCompleted ? 'border-slate-100 opacity-75' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 truncate">{customer?.name}</p>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                      <MapPin size={10} />
                      <span className="truncate">{customer?.address}</span>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">${job.price}</p>
                </div>
                
                <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg mb-3 line-clamp-1 border border-slate-100 italic">
                  "{job.description}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock size={14} />
                    <span className="text-xs font-bold">
                      {date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })} @ {date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle size={14} />
                      <span className="text-[10px] font-bold uppercase">Completed</span>
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Scheduled
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-12 px-4">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Calendar size={32} />
            </div>
            <p className="text-slate-500 font-medium">No jobs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
