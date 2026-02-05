
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

// Add sync status listener
const syncListeners = new Set<(status: 'idle' | 'saving' | 'saved' | 'error') => void>();

const emitChange = () => {
  listeners.forEach(listener => listener());
};

const emitSyncStatus = (status: 'idle' | 'saving' | 'saved' | 'error') => {
  syncListeners.forEach(l => l(status));
};

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
};

export function useAppStore() {
  const [, setTick] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    const syncListener = (s: 'idle' | 'saving' | 'saved' | 'error') => setSyncStatus(s);

    listeners.add(listener);
    syncListeners.add(syncListener);
    return () => {
      listeners.delete(listener);
      syncListeners.delete(syncListener);
    };
  }, []);


  const API_URL = 'https://windowrun-api.david-d4d.workers.dev';

  const setBusiness = async (business: Business, skipCloudSync = false) => {
    // 1. Update Local State Immediately (Optimistic)
    globalState = { ...globalState, business };
    globalIsAuthenticated = true; // Authenticate immediately
    saveToStorage();
    emitChange(); // Notify app immediately so navigation works

    // 2. Sync with Cloudflare D1 (Background)
    if (skipCloudSync) return;

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

  const syncDown = async (email: string, password?: string) => {
    const pwd = password || globalState.business?.password;
    if (!email || !pwd) return;

    try {
      const res = await fetch(`${API_URL}/sync-down`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd })
      });

      if (res.ok) {
        const data = await res.json();
        globalState = {
          ...globalState,
          customers: data.customers || [],
          quotes: data.quotes || [],
          jobs: data.jobs || []
        };
        saveToStorage();
        emitChange();
      }
    } catch (e) {
      console.error("Failed to sync down", e);
    }
  };

  const syncUp = async (type: 'customer' | 'quote' | 'job', item: any) => {
    const business = globalState.business;
    if (!business || !business.password) return;

    emitSyncStatus('saving');
    try {
      const res = await fetch(`${API_URL}/sync-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: business.email,
          password: business.password,
          type,
          item
        })
      });

      if (res.ok) {
        emitSyncStatus('saved');
        setTimeout(() => emitSyncStatus('idle'), 2000);
      } else {
        console.error("Server update failed", await res.text());
        emitSyncStatus('error');
      }
    } catch (e) {
      console.error("Failed to sync up", e);
      emitSyncStatus('error');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const business = globalState.business;
    if (!business || !business.email) return { success: false, message: 'Not logged in' };

    try {
      const res = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: business.email,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update local state with new password so sync keeps working
        globalState = {
          ...globalState,
          business: { ...globalState.business, password: newPassword } as Business
        };
        saveToStorage(); // Important to save this
        emitChange();
        return { success: true, message: 'Password updated successfully' };
      } else {
        return { success: false, message: data.error || 'Failed to update password' };
      }
    } catch (e) {
      console.error("Failed to change password", e);
      return { success: false, message: 'Network error' };
    }
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
      // Sync down in background to get latest
      if (globalState.business.email) syncDown(globalState.business.email, password);
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

        setBusiness(updatedBusiness as Business, true); // This saves and authenticates (skipping register)

        // Sync data down
        await syncDown(updatedBusiness.email, updatedBusiness.password);

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
    syncUp('customer', newCustomer);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const updatedCustomer = { ...globalState.customers.find(c => c.id === id)!, ...updates };
    globalState = {
      ...globalState,
      customers: globalState.customers.map(c => c.id === id ? updatedCustomer : c)
    };
    saveToStorage();
    emitChange();
    syncUp('customer', updatedCustomer);
  };

  const addQuote = (quote: Omit<Quote, 'id' | 'createdAt'>) => {
    const newQuote = { ...quote, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    globalState = {
      ...globalState,
      quotes: [...globalState.quotes, newQuote]
    };
    saveToStorage();
    emitChange();
    syncUp('quote', newQuote);
    return newQuote;
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    const updatedQuote = { ...globalState.quotes.find(q => q.id === id)!, ...updates };
    globalState = {
      ...globalState,
      quotes: globalState.quotes.map(q => q.id === id ? updatedQuote : q)
    };
    saveToStorage();
    emitChange();
    syncUp('quote', updatedQuote);
  };

  const addJob = (job: Omit<Job, 'id'>) => {
    const newJob = { ...job, id: crypto.randomUUID() };
    globalState = {
      ...globalState,
      jobs: [...globalState.jobs, newJob]
    };
    saveToStorage();
    emitChange();
    syncUp('job', newJob);
    return newJob;
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    const updatedJob = { ...globalState.jobs.find(j => j.id === id)!, ...updates };
    globalState = {
      ...globalState,
      jobs: globalState.jobs.map(j => j.id === id ? updatedJob : j)
    };
    saveToStorage();
    emitChange();
    syncUp('job', updatedJob);
  };

  const syncDelete = async (type: 'customer' | 'quote' | 'job', id: string) => {
    const business = globalState.business;
    if (!business || !business.password) return;

    emitSyncStatus('saving');
    try {
      const res = await fetch(`${API_URL}/sync-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: business.email,
          password: business.password,
          type,
          id
        })
      });

      if (res.ok) {
        emitSyncStatus('saved');
        setTimeout(() => emitSyncStatus('idle'), 2000);
      } else {
        console.error("Server delete failed", await res.text());
        emitSyncStatus('error');
      }
    } catch (e) {
      console.error("Failed to sync delete", e);
      emitSyncStatus('error');
    }
  };

  const deleteJob = (id: string) => {
    globalState = {
      ...globalState,
      jobs: globalState.jobs.filter(j => j.id !== id)
    };
    saveToStorage();
    emitChange();
    syncDelete('job', id);
  };

  const deleteCustomer = (id: string) => {
    globalState = {
      ...globalState,
      customers: globalState.customers.filter(c => c.id !== id)
    };
    saveToStorage();
    emitChange();
    syncDelete('customer', id);
  }

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
    deleteCustomer,
    addQuote,
    updateQuote,
    addJob,
    updateJob,
    deleteJob,
    convertQuoteToJob,
    syncAdminUsers,
    resetPassword,
    changePassword,
    syncStatus
  };
}
