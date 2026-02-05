
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArrowLeft, Save, CheckCircle, Send, Plus, Trash2 } from 'lucide-react';
import { JobStatus } from '../types';

const JobForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addJob, updateJob, deleteJob } = useAppStore();

  const [form, setForm] = useState<{
    customerId: string;
    description: string;
    price: string;
    scheduledDate: string;
    notes: string;
    status: JobStatus;
  }>({
    customerId: '',
    description: '',
    price: '',
    scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00',
    notes: '',
    status: 'scheduled'
  });

  const [loading, setLoading] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (id) {
      const existing = state.jobs.find(j => j.id === id);
      if (existing) {
        setForm({
          customerId: existing.customerId,
          description: existing.description,
          price: existing.price.toString(),
          scheduledDate: existing.scheduledDate,
          notes: existing.notes || '',
          status: existing.status
        });
      }
    }
  }, [id, state.jobs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      price: parseFloat(form.price) || 0
    };

    if (id) {
      updateJob(id, data);
    } else {
      addJob(data);
    }
    navigate('/jobs');
  };

  const markCompleted = () => {
    if (!id) return;
    updateJob(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    setForm(f => ({ ...f, status: 'completed' }));
  };

  const handleInvoiceWebhook = async () => {
    if (!id || !state.business?.webhookUrl) {
      alert('Please set up an Invoice Webhook URL in Settings first.');
      return;
    }

    setLoading(true);
    setWebhookMessage(null);

    const customer = state.customers.find(c => c.id === form.customerId);
    const job = state.jobs.find(j => j.id === id);

    const payload = {
      event: "invoice.requested",
      business: {
        name: state.business.name,
        abn: state.business.abn
      },
      customer: {
        name: customer?.name,
        address: customer?.address,
        email: customer?.email,
        phone: customer?.phone
      },
      job: {
        id: id,
        scheduled_for: job?.scheduledDate,
        description: job?.description,
        price: job?.price,
        status: job?.status
      },
      quote_id: job?.quoteId
    };

    try {
      const response = await fetch(state.business.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setWebhookMessage({ type: 'success', text: 'Invoice request sent successfully!' });
      } else {
        throw new Error('Server responded with ' + response.status);
      }
    } catch (err) {
      setWebhookMessage({ type: 'error', text: 'Failed to trigger webhook. Check settings.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit Job' : 'New Job'}</h1>
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
                price: customer?.defaultPrice?.toString() || form.price
              });
            }}
          >
            <option value="">Select a customer</option>
            {state.customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Description *</label>
          <input
            type="text"
            required
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Price ($) *</label>
            <input
              type="number"
              required
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Scheduled At</label>
            <input
              type="datetime-local"
              required
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.scheduledDate}
              onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Internal Notes</label>
          <textarea
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Save size={20} />
            {id ? 'Update Job' : 'Create Job'}
          </button>

          {id && form.status === 'scheduled' && (
            <button
              type="button"
              onClick={markCompleted}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <CheckCircle size={20} />
              Mark as Completed
            </button>
          )}

          {id && form.status === 'completed' && (
            <div className="space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleInvoiceWebhook}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                <Send size={20} />
                {loading ? 'Sending...' : 'Generate Invoice'}
              </button>

              {webhookMessage && (
                <div className={`p-4 rounded-xl text-center text-sm font-bold ${webhookMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                  {webhookMessage.text}
                </div>
              )}
            </div>
          )}

          {id && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
                  deleteJob(id);
                  navigate('/jobs');
                }
              }}
              className="w-full bg-white border border-red-200 text-red-600 font-bold py-4 rounded-xl shadow-sm flex items-center justify-center gap-2 active:bg-red-50 transition-colors mt-2"
            >
              <Trash2 size={20} />
              Delete Job
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default JobForm;
