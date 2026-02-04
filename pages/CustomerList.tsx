
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Added Users to the lucide-react imports
import { Search, Plus, MapPin, Phone, ChevronRight, Users } from 'lucide-react';
import { useAppStore } from '../store';

const CustomerList: React.FC = () => {
  const { state } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = state.customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <Link 
          to="/customers/new" 
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-100"
        >
          <Plus size={24} />
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(customer => (
            <Link 
              key={customer.id} 
              to={`/customers/${customer.id}`}
              className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl active:bg-slate-50 transition-colors shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-lg">
                {customer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{customer.name}</p>
                <div className="flex items-center gap-1 text-slate-500 text-sm mt-0.5">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{customer.address}</span>
                </div>
              </div>
              <ChevronRight className="text-slate-300" size={20} />
            </Link>
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Users size={32} />
            </div>
            <p className="text-slate-500 font-medium">No customers found</p>
            <p className="text-slate-400 text-sm mt-1">Add your first customer to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
