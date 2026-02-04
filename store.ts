
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

  const setBusiness = (business: Business) => {
    globalState = { ...globalState, business };
    saveToStorage();
    // If setting business (signup/setup), we generally consider them authenticated or we require login next.
    // Based on user flow, we'll auto-login on setup.
    if (globalState.business) {
      globalIsAuthenticated = true;
    }
    emitChange();
  };

  const login = (password: string) => {
    if (!globalState.business?.password) return false;
    if (globalState.business.password === password) {
      globalIsAuthenticated = true;
      emitChange();
      return true;
    }
    return false;
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
    addCustomer,
    updateCustomer,
    addQuote,
    updateQuote,
    addJob,
    updateJob,
    convertQuoteToJob
  };
}
