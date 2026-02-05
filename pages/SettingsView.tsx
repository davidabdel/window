
import React from 'react';
import { useAppStore } from '../store';
import { LogOut, Globe, Lock } from 'lucide-react';
import { Business } from '../types';

const ChangePasswordForm: React.FC = () => {
  const { changePassword } = useAppStore();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setStatus('loading');

    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setStatus('success');
        setMessage('Password updated!');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Failed to update password');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Current Password</label>
        <input
          type="password"
          required
          placeholder="Enter current password"
          className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">New Password</label>
        <input
          type="password"
          required
          placeholder="Enter new password"
          className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
      </div>

      {status === 'error' && <p className="text-red-500 text-xs">{message}</p>}
      {status === 'success' && <p className="text-green-500 text-xs">{message}</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
};

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

      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Lock size={12} /> Security
          </h2>
        </div>
        <div className="p-4">
          <ChangePasswordForm />
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
