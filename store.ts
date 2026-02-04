
import { useState, useEffect } from 'react';
import { AppState, Business, Customer, Quote, Job } from './types';

const STORAGE_KEY = 'window_cleaning_app_state';

const initialState: AppState = {
  business: null,
  customers: [],
  quotes: [],
  jobs: [],
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setBusiness = (business: Business) => {
    setState(prev => ({ ...prev, business }));
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const addQuote = (quote: Omit<Quote, 'id' | 'createdAt'>) => {
    const newQuote = { ...quote, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setState(prev => ({ ...prev, quotes: [...prev.quotes, newQuote] }));
    return newQuote;
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    setState(prev => ({
      ...prev,
      quotes: prev.quotes.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const addJob = (job: Omit<Job, 'id'>) => {
    const newJob = { ...job, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, jobs: [...prev.jobs, newJob] }));
    return newJob;
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(j => j.id === id ? { ...j, ...updates } : j)
    }));
  };

  const convertQuoteToJob = (quoteId: string, scheduledDate: string) => {
    const quote = state.quotes.find(q => q.id === quoteId);
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

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  };

  return {
    state,
    setBusiness,
    addCustomer,
    updateCustomer,
    addQuote,
    updateQuote,
    addJob,
    updateJob,
    convertQuoteToJob,
    logout
  };
}
