import api from './api';

export interface ContactRequestPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  order_reference?: string;
  subject: string;
  message: string;
  accepted_terms: boolean;
}

export type ContactRequestStatus = 'new' | 'in_progress' | 'done';

export interface ContactRequestResponse {
  id: number;
  status: ContactRequestStatus;
  order_reference?: string | null;
  message: string;
  created_at: string;
}

export interface ContactRequestValidationErrors {
  [field: string]: string[];
}

export const contactService = {
  async submitContact(payload: ContactRequestPayload): Promise<ContactRequestResponse> {
    const response = await api.post('/contact', payload);
    return response.data as ContactRequestResponse;
  },
};
