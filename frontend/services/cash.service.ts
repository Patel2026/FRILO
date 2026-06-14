import api from './api';

export interface CashEntry {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  label: string;
  entry_date: string;
  notes: string | null;
}

export interface CashEntryPayload {
  type: 'income' | 'expense';
  amount: number;
  label: string;
  entry_date: string;
  notes?: string;
}

export interface CashSummary {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CashEntriesResponse {
  data: CashEntry[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export const cashService = {
  async list(month: string, page = 1): Promise<CashEntriesResponse> {
    const { data } = await api.get<CashEntriesResponse>(`/cash?month=${month}&page=${page}`);
    return data;
  },

  async summary(month: string): Promise<CashSummary> {
    const { data } = await api.get<CashSummary>(`/cash/summary?month=${month}`);
    return data;
  },

  async create(payload: CashEntryPayload): Promise<CashEntry> {
    const { data } = await api.post<CashEntry>('/cash', payload);
    return data;
  },

  async update(id: number, payload: CashEntryPayload): Promise<CashEntry> {
    const { data } = await api.put<CashEntry>(`/cash/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/cash/${id}`);
  },
};
