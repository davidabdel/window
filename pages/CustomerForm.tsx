
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArrowLeft, Save, MapPin } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

// NOTE: Replace with your actual Google Maps API Key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const CustomerForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addCustomer, updateCustomer } = useAppStore();

  const [form, setForm] = useState({
    name: '',
    businessName: '',
    address: '',
    phone: '',
    email: '',
    defaultPrice: '',
    notes: ''
  });

  const [predictions, setPredictions] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const existing = state.customers.find(c => c.id === id);
      if (existing) {
        setForm({
          name: existing.name,
          businessName: existing.businessName || '',
          address: existing.address,
          phone: existing.phone || '',
          email: existing.email || '',
          defaultPrice: existing.defaultPrice?.toString() || '',
          notes: existing.notes || ''
        });
      }
    }
  }, [id, state.customers]);

  // Load Google Maps Script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    const loadScript = () => {
      // If already loaded and available
      if (window.google?.maps?.places) {
        initService();
        return;
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        // Script exists, check if loaded?
        if (window.google?.maps?.places) initService();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setScriptError('Google Maps failed to load. Please disable ad blockers.');
        console.error('Google Maps script load error - likely blocked by client');
      };
      document.head.appendChild(script);

      // Poll for Google Maps to be ready (since we use loading=async)
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkGoogle);
          initService();
        }
      }, 100);

      // Timeout after 10s
      setTimeout(() => clearInterval(checkGoogle), 10000);
    };

    loadScript();

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initService = () => {
    if (!window.google?.maps?.places) {
      console.warn("Google Maps Places library not ready yet.");
      return;
    }

    try {
      if (!autocompleteService.current) {
        // Check if AutocompleteService exists (it might be deprecated in 2026 for new keys)
        if (window.google.maps.places.AutocompleteService) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
        } else {
          console.error("AutocompleteService is missing. API might be deprecated.");
          setScriptError("Detailed Address Autocomplete is not available for this API key.");
        }
      }
      if (!placesService.current && window.google.maps.places.PlacesService) {
        const dummy = document.createElement('div');
        placesService.current = new window.google.maps.places.PlacesService(dummy);
      }
    } catch (e) {
      console.error("Error initializing Google Maps Services:", e);
      setScriptError("Error initializing Maps services.");
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, address: value });

    if (!value) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (autocompleteService.current) {
      autocompleteService.current.getPlacePredictions({
        input: value,
        componentRestrictions: { country: 'au' },
        types: ['address']
      }, (results: any[], status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      });
    }
  };

  const selectPrediction = (description: string) => {
    setForm(prev => ({ ...prev, address: description }));
    setShowPredictions(false);
  };

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
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Business Name (Optional)</label>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.businessName}
            onChange={e => setForm({ ...form, businessName: e.target.value })}
            placeholder="e.g. Acme Corp"
          />
        </div>

        <div className="space-y-1" ref={wrapperRef}>
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Full Address *</label>
          <div className="relative">
            <input
              type="text"
              required
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 pl-10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.address}
              onChange={handleAddressChange}
              onFocus={() => {
                if (predictions.length > 0) setShowPredictions(true);
              }}
              placeholder="Start typing specific address..."
              autoComplete="off"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

            {showPredictions && predictions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
                {predictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b last:border-0 border-slate-50 transition-colors flex items-center gap-2"
                    onClick={() => selectPrediction(prediction.description)}
                  >
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate text-slate-700">{prediction.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 px-1 italic">
            {!GOOGLE_MAPS_API_KEY ? 'Please add VITE_GOOGLE_MAPS_API_KEY in .env.local' : 'Powered by Google'}
            {scriptError && <span className="text-red-500 block font-bold mt-1">{scriptError}</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Phone</label>
            <input
              type="tel"
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Email</label>
            <input
              type="email"
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">Default Job Price ($)</label>
          <input
            type="number"
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={form.defaultPrice}
            onChange={e => setForm({ ...form, defaultPrice: e.target.value })}
          />
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
