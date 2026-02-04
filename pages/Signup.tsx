
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Briefcase, Mail, Lock, User, Hash } from 'lucide-react';

const Signup: React.FC = () => {
  const { setBusiness } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    businessName: '',
    abn: '',
    webhookUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusiness({
      name: form.businessName,
      abn: form.abn,
      webhookUrl: form.webhookUrl,
      email: form.email
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
            <Briefcase size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Setup Business</h1>
          <p className="text-slate-500 mt-2">Get started with your solo cleaning hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="john@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Business Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Elite Windows"
                value={form.businessName}
                onChange={e => setForm({...form, businessName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">ABN</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="12 345 678 901"
                value={form.abn}
                onChange={e => setForm({...form, abn: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all mt-4"
          >
            Create My Business
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
