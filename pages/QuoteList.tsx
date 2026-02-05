import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, ChevronRight, Clock, CheckCircle, FileText, XCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { QuoteStatus } from '../types';

const QuoteList: React.FC = () => {
  const { state } = useAppStore();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const statusFilter = searchParams.get('status') as QuoteStatus | null;

  const filtered = useMemo(() => {
    return state.quotes.filter(q => {
      const customer = state.customers.find(c => c.id === q.customerId);
      const matchesSearch = customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        q.description.toLowerCase().includes(search.toLowerCase());

      // If explicit status filter from URL, respect it (overrides tabs)
      if (statusFilter) {
        return matchesSearch && q.status === statusFilter;
      }

      // Otherwise use tabs
      let matchesTab = false;
      if (activeTab === 'active') {
        matchesTab = q.status === 'draft' || q.status === 'needs-follow-up';
      } else {
        matchesTab = q.status === 'accepted' || q.status === 'rejected';
      }

      return matchesSearch && matchesTab;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.quotes, state.customers, search, statusFilter, activeTab]);

  const statusIcons = {
    'draft': <Clock className="text-slate-400" size={14} />,
    'needs-follow-up': <Clock className="text-amber-500" size={14} />,
    'accepted': <CheckCircle className="text-emerald-500" size={14} />,
    'rejected': <XCircle className="text-red-500" size={14} />
  };

  const statusLabels = {
    'draft': 'Draft',
    'needs-follow-up': 'Follow Up',
    'accepted': 'Accepted',
    'rejected': 'Rejected'
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Quotes</h1>
        <Link
          to="/quotes/new"
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-100"
        >
          <Plus size={24} />
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          Open
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === 'archived' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          Archived
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Search quotes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {statusFilter && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-100 p-3 rounded-xl">
          <span className="text-sm font-medium text-amber-800 capitalize">Showing: {statusFilter.replace(/-/g, ' ')}</span>
          <Link to="/quotes" className="text-xs font-bold text-amber-600 uppercase">Clear</Link>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(quote => {
            const customer = state.customers.find(c => c.id === quote.customerId);
            return (
              <Link
                key={quote.id}
                to={`/quotes/${quote.id}`}
                className={`flex flex-col gap-2 bg-white border p-4 rounded-2xl active:bg-slate-50 transition-colors shadow-sm ${quote.status === 'needs-follow-up' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900">{customer?.name || 'Unknown Customer'}</p>
                    <p className="text-sm text-slate-500 line-clamp-1">{quote.description}</p>
                  </div>
                  <p className="font-bold text-lg text-slate-900">${quote.amount}</p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                    {statusIcons[quote.status]}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${quote.status === 'rejected' ? 'text-red-500' :
                      quote.status === 'accepted' ? 'text-emerald-600' : 'text-slate-600'
                      }`}>
                      {statusLabels[quote.status]}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-12 px-4">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FileText size={32} />
            </div>
            <p className="text-slate-500 font-medium">No quotes found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteList;
