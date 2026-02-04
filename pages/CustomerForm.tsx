
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const CustomerForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addCustomer, updateCustomer } = useAppStore();
  
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    defaultPrice: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      const existing = state.customers.find(c => c.id === id);
      if (existing) {
        setForm({
          name: existing.name,
          address: existing.address,
          phone: existing.phone || '',
          email: existing.email || '',
          defaultPrice: existing.defaultPrice?.toString() || '',
          notes: existing.notes || ''
        });
      }
    }
  }, [id, state.customers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      defaultPrice: form.defaultPrice ? parseFloat(form.defaultPrice) : undefined
    };

    if (id) {
      updateCustomer(id, data);
    } else {
      addCustomer(data);
    }
    navigate('/customers');
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit Customer' : 'New Customer'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Customer Name *</label>
          <input 
            type="text" 
            required
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Full Address *</label>
          <input 
            type="text" 
            required
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.address}
            onChange={e => setForm({...form, address: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Phone</label>
            <input 
              type="tel" 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Default Job Price ($)</label>
          <input 
            type="number" 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.defaultPrice}
            onChange={e => setForm({...form, defaultPrice: e.target.value})}
          />
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

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Save size={20} />
          {id ? 'Update Customer' : 'Create Customer'}
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
