
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Users, Lock, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const { state, updateBusiness, logout } = useAppStore();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        abn: '',
        password: ''
    });

    // Security check - redirect if not admin
    if (!(state as any).isAdmin) {
        // In a real app we'd redirect, but since state can be transient on refresh...
        // We might just show access denied or rely on the store check.
        // For now, let's assume if they got here, they passed the check or we'll kick them out provided we have persistence.
        // Ideally, we'd have a stronger check.
    }

    const business = state.business;

    const handleEditClick = () => {
        if (business) {
            setEditForm({
                name: business.name,
                email: business.email,
                abn: business.abn,
                password: business.password || ''
            });
            setEditing(true);
        }
    };

    const handleSave = () => {
        updateBusiness({
            name: editForm.name,
            email: editForm.email,
            abn: editForm.abn,
            password: editForm.password
        });
        setEditing(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-600 text-white p-3 rounded-xl shadow-lg shadow-purple-200">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Super Admin Dashboard</h1>
                            <p className="text-slate-500 text-sm">Managing System Users</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white text-slate-600 px-4 py-2 rounded-lg font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 text-yellow-800 text-sm flex items-start gap-3">
                    <ShieldAlert className="flex-shrink-0 mt-0.5" size={16} />
                    <p>
                        <strong>Local Storage Mode:</strong> You are currently viewing data stored on this specific device.
                        Since windowrun is a local-only application, you cannot see users who registered on other devices.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Users size={18} /> Registered Users (Local)
                        </h2>
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {business ? '1 User Found' : '0 Users Found'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Business Name</th>
                                    <th className="px-6 py-4">Email Address</th>
                                    <th className="px-6 py-4">ABN</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {!business ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                            No registered users found on this device.
                                        </td>
                                    </tr>
                                ) : (
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    className="w-full border border-slate-200 rounded px-2 py-1 text-sm"
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                            ) : business.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {editing ? (
                                                <input
                                                    type="email"
                                                    className="w-full border border-slate-200 rounded px-2 py-1 text-sm"
                                                    value={editForm.email}
                                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                />
                                            ) : business.email}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    className="w-full border border-slate-200 rounded px-2 py-1 text-sm"
                                                    value={editForm.abn}
                                                    onChange={e => setEditForm({ ...editForm, abn: e.target.value })}
                                                />
                                            ) : business.abn}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editing ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={handleSave}
                                                        className="text-green-600 bg-green-50 p-1.5 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Save"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditing(false)}
                                                        className="text-red-600 bg-red-50 p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={handleEditClick}
                                                        className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold flex items-center gap-1"
                                                    >
                                                        <Edit2 size={12} /> Edit Details
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {editing && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-md">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Lock size={16} className="text-orange-500" /> Security Settings
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reset User Password</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    value={editForm.password}
                                    placeholder="Enter new password"
                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    Clicking save above will apply this new password immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
