
import React from 'react';
import { useAppStore } from '../store';
import { LogOut, Globe } from 'lucide-react';
import { Business } from '../types';

const SettingsPage: React.FC = () => {
  const { state, setBusiness, logout } = useAppStore();

  const handleUpdate = (updates: Partial<Business>) => {
    if (state.business) {
      setBusiness({ ...state.business, ...updates });
    }
  };

  if (!state.business) return null;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Business Profile</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Business Name</label>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={state.business.name}
              onChange={e => handleUpdate({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">ABN</label>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={state.business.abn}
              onChange={e => handleUpdate({ abn: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Integrations</h2>
        </div>
        <div className="p-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Globe size={10} /> Invoice Webhook URL
            </label>
            <input 
              type="url"
              className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://hooks.example.com/..."
              value={state.business.webhookUrl}
              onChange={e => handleUpdate({ webhookUrl: e.target.value })}
            />
            <p className="text-[10px] text-slate-400 mt-1">This URL is triggered when you tap "Generate Invoice" on a completed job.</p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all data and logout?')) {
              logout();
            }
          }}
          className="w-full bg-white border border-red-200 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Logout & Reset App
        </button>
        <p className="text-center text-xs text-slate-400">Version 1.0.0 (MVP Build)</p>
      </div>
    </div>
  );
};

export default SettingsPage;
