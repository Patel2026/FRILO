import api from './api';

export interface Deadline {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  is_system: boolean;
  days_remaining: number;
}

export interface DeadlinePayload {
  title: string;
  description?: string;
  due_date: string;
}

interface DeadlineRequestOptions {
  suppressAuthRedirect?: boolean;
}

export const deadlinesService = {
  async list(options: DeadlineRequestOptions = {}): Promise<Deadline[]> {
    const { data } = await api.get<Deadline[]>('/deadlines', {
      suppressAuthRedirect: options.suppressAuthRedirect,
    });
    return data;
  },

  async create(payload: DeadlinePayload): Promise<Deadline> {
    const { data } = await api.post<Deadline>('/deadlines', payload);
    return data;
  },

  async update(id: number, payload: DeadlinePayload): Promise<Deadline> {
    const { data } = await api.put<Deadline>(`/deadlines/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/deadlines/${id}`);
  },
};
