import api from './api';

export interface Sector {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    gradient: string;
}

export interface Template {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    features: string[] | string; // API might return JSON string or array
    thumbnail: string;
    full_thumbnail_url: string;
    preview_url?: string;
    is_active: boolean;
    sector_id: number;
    sector?: Sector;
}

export const businessService = {
    async getSectors(): Promise<Sector[]> {
        const response = await api.get('/sectors');
        // Inject gradients purely on frontend for now
        const gradients = [
            'from-orange-400 to-red-500',
            'from-blue-500 to-cyan-400',
            'from-green-400 to-emerald-600',
            'from-slate-600 to-slate-800',
            'from-purple-500 to-indigo-600',
            'from-indigo-400 to-blue-600'
        ];

        return response.data.map((sector: any, index: number) => ({
            ...sector,
            gradient: sector.gradient || gradients[index % gradients.length]
        }));
    },

    async getTemplates(sectorSlug?: string): Promise<Template[]> {
        const params = sectorSlug ? { sector_slug: sectorSlug } : {};
        const response = await api.get('/templates', { params });
        return response.data;
    },

    async getTemplate(id: string): Promise<Template> {
        const response = await api.get(`/templates/${id}`);
        return response.data;
    },

    async createOrder(data: any): Promise<any> {
        const response = await api.post('/orders', data);
        return response.data;
    },

    async getOrders(): Promise<any[]> {
        const response = await api.get('/orders');
        return response.data;
    }
};
