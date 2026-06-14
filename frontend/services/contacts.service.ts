import api from './api';

export interface ClientContact {
  id: number;
  name: string;
  company: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  notes: string | null;
  acquired_at: string | null;
}

export interface ContactsPayload {
  name: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  acquired_at?: string;
}

export interface ContactsResponse {
  data: ClientContact[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export const contactsService = {
  async list(page = 1): Promise<ContactsResponse> {
    const { data } = await api.get<ContactsResponse>(`/contacts?page=${page}`);
    return data;
  },

  async create(payload: ContactsPayload): Promise<ClientContact> {
    const { data } = await api.post<ClientContact>('/contacts', payload);
    return data;
  },

  async update(id: number, payload: ContactsPayload): Promise<ClientContact> {
    const { data } = await api.put<ClientContact>(`/contacts/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/contacts/${id}`);
  },
};
