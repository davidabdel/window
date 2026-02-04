
export type QuoteStatus = 'draft' | 'needs-follow-up' | 'accepted';
export type JobStatus = 'scheduled' | 'completed';

export interface Business {
  name: string;
  abn: string;
  webhookUrl: string;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  defaultPrice?: number;
  notes?: string;
}

export interface Quote {
  id: string;
  customerId: string;
  description: string;
  amount: number;
  notes?: string;
  status: QuoteStatus;
  createdAt: string;
}

export interface Job {
  id: string;
  customerId: string;
  quoteId?: string;
  description: string;
  scheduledDate: string;
  price: number;
  notes?: string;
  status: JobStatus;
  completedAt?: string;
}

export interface AppState {
  business: Business | null;
  customers: Customer[];
  quotes: Quote[];
  jobs: Job[];
}
