
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArrowLeft, Save, Briefcase, Plus, Calendar } from 'lucide-react';
import { QuoteStatus } from '../types';

const QuoteForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addQuote, updateQuote, convertQuoteToJob } = useAppStore();
  
  const [form, setForm] = useState<{
    customerId: string;
    description: string;
    amount: string;
    notes: string;
    status: QuoteStatus;
  }>({
    customerId: '',
    description: '',
    amount: '',
    notes: '',
    status: 'draft'
  });

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0] + 'T09:00');

  useEffect(() => {
    if (id) {
      const existing = state.quotes.find(q => q.id === id);
      if (existing) {
        setForm({
          customerId: existing.customerId,
          description: existing.description,
          amount: existing.amount.toString(),
          notes: existing.notes || '',
          status: existing.status
        });
      }
    }
  }, [id, state.quotes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      amount: parseFloat(form.amount) || 0
    };

    if (id) {
      updateQuote(id, data);
    } else {
      addQuote(data);
    }
    navigate('/quotes');
  };

  const handleConvert = () => {
    if (!id) return;
    convertQuoteToJob(id, scheduledDate);
    navigate('/jobs');
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit Quote' : 'New Quote'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Customer *</label>
          <select 
            required
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
            value={form.customerId}
            onChange={e => {
              const customerId = e.target.value;
              const customer = state.customers.find(c => c.id === customerId);
              setForm({
                ...form, 
                customerId,
                amount: customer?.defaultPrice?.toString() || form.amount
              });
            }}
          >
            <option value="">Select a customer</option>
            {state.customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Link to="/customers/new" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 uppercase mt-2 px-1">
            <Plus size={14} /> Add New Customer
          </Link>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Description *</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Full interior & exterior clean"
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Amount ($) *</label>
            <input 
              type="number" 
              required
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Status</label>
            <select 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
              value={form.status}
              onChange={e => setForm({...form, status: e.target.value as QuoteStatus})}
            >
              <option value="draft">Draft</option>
              <option value="needs-follow-up">Needs Follow-Up</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Internal Notes</label>
          <textarea 
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})}
          />
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Save size={20} />
            {id ? 'Update Quote' : 'Create Quote'}
          </button>

          {id && form.status !== 'accepted' && (
            <button 
              type="button"
              onClick={() => setShowConvertModal(true)}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Briefcase size={20} />
              Convert to Job
            </button>
          )}
        </div>
      </form>

      {showConvertModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Schedule This Job</h3>
              <p className="text-sm text-slate-500 mt-1">When is this work taking place?</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={handleConvert}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-50 hover:bg-emerald-700 transition-colors"
              >
                Confirm & Create Job
              </button>
              <button 
                onClick={() => setShowConvertModal(false)}
                className="w-full bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteForm;
