
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Users, Lock, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const { state, updateBusiness, logout, syncAdminUsers } = useAppStore();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [cloudUsers, setCloudUsers] = useState<any[]>([]);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        abn: '',
        password: ''
    });

    React.useEffect(() => {
        if ((state as any).isAdmin) {
            syncAdminUsers().then(users => {
                if (users) setCloudUsers(users);
            });
        }
    }, [state]);

    // Security check - redirect if not admin
    if (!(state as any).isAdmin) {
        // In a real app we'd redirect...
    }

    const business = state.business;

    const handleEditClick = (user?: any) => {
        const target = user || business;
        if (target) {
            setEditForm({
                name: target.name || target.businessName,
                email: target.email,
                abn: target.abn,
                password: target.password || ''
            });
            setEditing(true);
        }
    };

    const handleSave = () => {
        // For now only local update is fully hooked up in UI for "local business"
        // In full version, we'd send update to API too
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

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-blue-800 text-sm flex items-start gap-3">
                    <Users className="flex-shrink-0 mt-0.5" size={16} />
                    <p>
                        <strong>Cloud Sync Active:</strong> You are viewing users from the Cloudflare D1 Database.
                        Password resets here will sync to their devices on next login.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Users size={18} /> Registered Users (Cloud)
                        </h2>
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {cloudUsers.length} Users Found
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
                                {cloudUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                            No registered users found in cloud yet.
                                        </td>
                                    </tr>
                                ) : (
                                    cloudUsers.map((user, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {user.businessName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                {user.abn}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* Actions */}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
