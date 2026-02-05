
import { useState, useEffect } from 'react';
import { AppState, Business, Customer, Quote, Job } from './types';

const STORAGE_KEY = 'windowrun_app_state_v1';

const initialState: AppState = {
  business: null,
  customers: [],
  quotes: [],
  jobs: [],
};

// Global in-memory state
let globalState: AppState = initialState;
let globalIsAuthenticated = false;

// Initialize from storage immediately
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    globalState = JSON.parse(saved);
  }
} catch (e) {
  console.error('Failed to load state', e);
}

// Subscription system
const listeners = new Set<() => void>();

const emitChange = () => {
  listeners.forEach(listener => listener());
};

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
};

export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);


  const API_URL = 'https://windowrun-api.david-d4d.workers.dev';

  const setBusiness = async (business: Business) => {
    // 1. Update Local State Immediately (Optimistic)
    globalState = { ...globalState, business };
    globalIsAuthenticated = true; // Authenticate immediately
    saveToStorage();
    emitChange(); // Notify app immediately so navigation works

    // 2. Sync with Cloudflare D1 (Background)
    try {
      await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: business.name,
          email: business.email,
          abn: business.abn,
          password: business.password
        })
      });
    } catch (e) {
      console.error("Failed to sync signup to cloud", e);
    }
  };

  const updateBusiness = (updates: Partial<Business>) => {
    if (!globalState.business) return;
    globalState = {
      ...globalState,
      business: { ...globalState.business, ...updates }
    };
    saveToStorage();
    emitChange();
  };

  const syncAdminUsers = async () => {
    if (!(globalState as any).isAdmin) return;
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'X-Admin-Key': 'some-secret-key' } // In real helper add this
      });
      if (res.ok) {
        // This is where we would merge cloud users into local view for admin
        // For now, let's just return them or store them in a special 'adminViewUsers' state
        const cloudUsers = await res.json();
        return cloudUsers;
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
    return [];
  };

  const login = async (password: string, email?: string) => {
    // Super Admin Check
    if (email === 'david@uconnect.com.au' && password === 'admin123') {
      globalIsAuthenticated = true;
      (globalState as any).isAdmin = true;
      emitChange();
      return { success: true, isAdmin: true };
    }

    // If local matches, great
    if (globalState.business?.password === password && (!email || email === globalState.business.email)) {
      globalIsAuthenticated = true;
      (globalState as any).isAdmin = false;
      emitChange();
      return { success: true, isAdmin: false };
    }

    // Fallback: Check server (e.g. if password was reset)
    try {
      if (!email && globalState.business?.email) {
        email = globalState.business.email;
      }

      if (!email) return { success: false };

      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        // Update local state with new data from server
        // Ensure we keep existing business data but update what we got from server
        const updatedBusiness = {
          ...globalState.business, // Start with what we have
          // Overwrite with server data (mapping server columns to our typings if needed)
          // Assuming server returns matches Business interface: name, email, abn, password...
          name: data.user.businessName || data.user.name,
          email: data.user.email,
          abn: data.user.abn,
          password: data.user.password, // IMPORTANT: Update the local password
          webhookUrl: globalState.business?.webhookUrl || '' // Preserve or default
        };

        setBusiness(updatedBusiness as Business); // This saves and authenticates
        return { success: true, isAdmin: false };
      }

    } catch (e) {
      console.error("Login fallback failed", e);
    }

    return { success: false };
  };

  const resetPassword = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Failed to reset password' };
    } catch (e) {
      console.error("Failed to request password reset", e);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    globalIsAuthenticated = false;
    emitChange();
  };

  const resetApp = () => {
    localStorage.removeItem(STORAGE_KEY);
    globalState = {
      business: null,
      customers: [],
      quotes: [],
      jobs: []
    };
    globalIsAuthenticated = false;
    emitChange();
  }

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: crypto.randomUUID() };
    globalState = {
      ...globalState,
      customers: [...globalState.customers, newCustomer]
    };
    saveToStorage();
    emitChange();
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    globalState = {
      ...globalState,
      customers: globalState.customers.map(c => c.id === id ? { ...c, ...updates } : c)
    };
    saveToStorage();
    emitChange();
  };

  const addQuote = (quote: Omit<Quote, 'id' | 'createdAt'>) => {
    const newQuote = { ...quote, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    globalState = {
      ...globalState,
      quotes: [...globalState.quotes, newQuote]
    };
    saveToStorage();
    emitChange();
    return newQuote;
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    globalState = {
      ...globalState,
      quotes: globalState.quotes.map(q => q.id === id ? { ...q, ...updates } : q)
    };
    saveToStorage();
    emitChange();
  };

  const addJob = (job: Omit<Job, 'id'>) => {
    const newJob = { ...job, id: crypto.randomUUID() };
    globalState = {
      ...globalState,
      jobs: [...globalState.jobs, newJob]
    };
    saveToStorage();
    emitChange();
    return newJob;
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    globalState = {
      ...globalState,
      jobs: globalState.jobs.map(j => j.id === id ? { ...j, ...updates } : j)
    };
    saveToStorage();
    emitChange();
  };

  const convertQuoteToJob = (quoteId: string, scheduledDate: string, recurrence?: Job['recurrence']) => {
    const quote = globalState.quotes.find(q => q.id === quoteId);
    if (!quote) return;

    addJob({
      customerId: quote.customerId,
      quoteId: quote.id,
      description: quote.description,
      scheduledDate,
      price: quote.amount,
      notes: quote.notes,
      status: 'scheduled',
      recurrence
    });

    updateQuote(quoteId, { status: 'accepted' });
  };

  return {
    state: globalState,
    isAuthenticated: globalIsAuthenticated,
    setBusiness,
    login,
    logout,
    resetApp,
    updateBusiness,
    addCustomer,
    updateCustomer,
    addQuote,
    updateQuote,
    addJob,
    updateJob,
    convertQuoteToJob,
    syncAdminUsers,
    resetPassword
  };
}
