
import { useState, useEffect } from 'react';
import { AppState, Business, Customer, Quote, Job } from './types';

const STORAGE_KEY = 'windowrun_app_state';

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
    globalState = { ...globalState, business };
    saveToStorage();

    // Sync with Cloudflare D1
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
      // We don't block the user, we just log it. 
      // In a real app we'd queue this for retry.
    }

    if (globalState.business) {
      globalIsAuthenticated = true;
    }
    emitChange();
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

    // Regular User Check
    if (!globalState.business?.password) return { success: false };

    // If email is provided, verify it matches
    if (email && email !== globalState.business.email) {
      return { success: false };
    }

    if (globalState.business.password === password) {
      globalIsAuthenticated = true;
      (globalState as any).isAdmin = false;
      emitChange();
      return { success: true, isAdmin: false };
    }
    return { success: false };
  };

  const logout = () => {
    globalIsAuthenticated = false;
    emitChange();
  };

  const resetApp = () => {
    localStorage.removeItem(STORAGE_KEY);
    globalState = initialState;
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

  const convertQuoteToJob = (quoteId: string, scheduledDate: string) => {
    const quote = globalState.quotes.find(q => q.id === quoteId);
    if (!quote) return;

    addJob({
      customerId: quote.customerId,
      quoteId: quote.id,
      description: quote.description,
      scheduledDate,
      price: quote.amount,
      notes: quote.notes,
      status: 'scheduled'
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
    syncAdminUsers
  };
}
