
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Calendar, CheckCircle, ChevronRight, MapPin, Clock, Repeat } from 'lucide-react';
import { useAppStore } from '../store';

const JobList: React.FC = () => {
  const { state } = useAppStore();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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
    { label: 'Completed', id: 'completed' },
  ];

  // Calculate YTD Total Invoiced (Financial Year: 1st July to Now)
  const ytdTotal = useMemo(() => {
    if (viewFilter !== 'completed') return 0;

    const now = new Date();
    // If current month is before July (0-5), current FY started July 1 of PREVIOUS year.
    // If current month is July or later (6-11), current FY started July 1 of CURRENT year.
    const startYear = now.getMonth() < 6 ? now.getFullYear() - 1 : now.getFullYear();
    const startOfFY = new Date(startYear, 6, 1); // Month is 0-indexed, so 6 is July

    return state.jobs
      .filter(j => j.status === 'completed' && j.completedAt)
      .reduce((sum, j) => {
        const completedDate = new Date(j.completedAt!);
        if (completedDate >= startOfFY && completedDate <= now) {
          return sum + (j.price || 0);
        }
        return sum;
      }, 0);
  }, [state.jobs, viewFilter]);

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

      <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          Calendar
        </button>
      </div>

      {viewMode === 'list' && (
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto gap-1 mb-4">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={`/jobs?view=${tab.id}`}
              className={`flex-1 min-w-[70px] py-2 text-[11px] font-bold uppercase text-center rounded-lg transition-all ${viewFilter === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      {viewFilter === 'completed' && viewMode === 'list' && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">YTD Total Invoiced</p>
            <p className="text-xs text-emerald-500 mt-0.5">Financial Year (July 1st - Present)</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">${ytdTotal.toFixed(2)}</p>
        </div>
      )}

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

      {viewMode === 'calendar' ? (
        <CalendarView jobs={filtered} customers={state.customers} />
      ) : (
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
                  className={`block bg-white border p-4 rounded-2xl active:bg-slate-50 transition-colors shadow-sm ${isCompleted ? 'border-slate-100 opacity-75' : 'border-slate-200'
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
                    {job.recurrence && (
                      <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                        <Repeat size={10} />
                        <span className="text-[10px] font-bold uppercase">{job.recurrence.frequency}</span>
                      </div>
                    )}
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
      )}
    </div>
  );
};

export default JobList;

import { Job, Customer } from '../types';

const CalendarView: React.FC<{
  jobs: Job[],
  customers: Customer[]
}> = ({ jobs, customers }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthJobs = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const virtualJobs: Job[] = [];

    jobs.forEach(job => {
      const jobDate = new Date(job.scheduledDate);

      // If simple job (no recurrence), just check if it fits
      if (!job.recurrence) {
        if (jobDate.getMonth() === currentDate.getMonth() && jobDate.getFullYear() === currentDate.getFullYear()) {
          virtualJobs.push(job);
        }
        return;
      }

      // If recurring, generate instances
      let currentInstanceDate = new Date(jobDate);

      // If the job started before this month, we need to advance it to at least the start of this month
      // This is a naive implementation; for efficiency one might calculate the jump mathematically.
      // But for <100 jobs, a while loop is fine.

      // However, we must ensure we align with the proper interval.
      // Easiest correct way: Start from original date and add intervals until we hit or pass the month window.

      const endDate = job.recurrence.endDate ? new Date(job.recurrence.endDate) : new Date(9999, 11, 31);

      while (currentInstanceDate <= endOfMonth && currentInstanceDate <= endDate) {
        // If instance is within current month, add it
        if (currentInstanceDate >= startOfMonth && currentInstanceDate <= endOfMonth) {
          // Create a virtual job instance, cloning the original but updating the date
          // We append a suffix to ID to ensure unique keys in map
          virtualJobs.push({
            ...job,
            id: `${job.id}-${currentInstanceDate.toISOString()}`, // Virtual ID
            scheduledDate: currentInstanceDate.toISOString().split('T')[0]
          });
        }

        // Advance date
        if (job.recurrence.frequency === 'weekly') {
          currentInstanceDate.setDate(currentInstanceDate.getDate() + 7);
        } else if (job.recurrence.frequency === 'fortnightly') {
          currentInstanceDate.setDate(currentInstanceDate.getDate() + 14);
        } else if (job.recurrence.frequency === 'monthly') {
          currentInstanceDate.setMonth(currentInstanceDate.getMonth() + 1);
        } else {
          break; // Safety
        }
      }
    });

    return virtualJobs;
  }, [jobs, currentDate]);

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const startDay = startDayOfMonth(currentDate);

    // Padding for empty start days
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50 border border-slate-100/50"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const daysJobs = monthJobs.filter(j => j.scheduledDate.startsWith(dateStr));

      days.push(
        <div key={day} className="h-24 border border-slate-100 p-1 relative hover:bg-slate-50 transition-colors">
          <div className="text-right">
            <span className={`text-xs font-bold ${daysJobs.length > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
              {day}
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[70px]">
            {daysJobs.map(job => {
              const customer = customers.find(c => c.id === job.customerId);
              return (
                <Link
                  to={`/jobs/${job.id}`}
                  key={job.id}
                  className={`text-[10px] p-1 rounded font-medium truncate leading-tight ${job.status === 'completed'
                    ? 'bg-slate-100 text-slate-500 line-through'
                    : 'bg-blue-100 text-blue-700'
                    }`}
                  title={`${customer?.name} - ${job.description}`}
                >
                  {customer?.name}
                </Link>
              );
            })}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <h2 className="font-bold text-slate-800">
          {currentDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center py-2 bg-slate-50 text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="grid grid-cols-7">
        {renderDays()}
      </div>
    </div>
  );
};
