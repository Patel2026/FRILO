import api from './api';

export interface Sector {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    gradient?: string;
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

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderInstruction {
    id?: number;
    enterprise_name: string | null;
    activity_description: string | null;
    colors: string[];
    specific_instructions: string | null;
}

export interface Order {
    id: number;
    status: OrderStatus;
    price: number;
    created_at: string;
    template: {
        id: number;
        name: string;
        sector: {
            id: number;
            name: string;
            slug: string;
        } | null;
    } | null;
    instruction: OrderInstruction | null;
    // Backward compatibility with older payloads
    instructions?: OrderInstruction[];
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
    links: PaginationLinks;
}

export interface CreateOrderPayload {
    template_id: string | null;
    enterprise_name?: string;
    activity_description?: string;
    colors?: string[];
    specific_instructions?: string;
}

export const businessService = {
    async getSectors(): Promise<Sector[]> {
        const response = await api.get('/sectors');
        const rawSectors = Array.isArray(response.data) ? response.data : [];
        // Inject gradients purely on frontend for now
        const gradients = [
            'from-orange-400 to-red-500',
            'from-blue-500 to-cyan-400',
            'from-green-400 to-emerald-600',
            'from-slate-600 to-slate-800',
            'from-purple-500 to-indigo-600',
            'from-indigo-400 to-blue-600'
        ];

        return rawSectors.map((sector: Sector, index: number) => ({
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

    async createOrder(data: CreateOrderPayload): Promise<Order> {
        const response = await api.post('/orders', data);
        return response.data;
    },

    async getOrders(page = 1, perPage = 10): Promise<PaginatedResponse<Order>> {
        const response = await api.get('/orders', {
            params: {
                page,
                per_page: perPage,
            }
        });

        // V1 stable paginated contract
        if (response.data?.data && Array.isArray(response.data.data)) {
            return response.data as PaginatedResponse<Order>;
        }

        // Legacy fallback (non-paginated array)
        if (Array.isArray(response.data)) {
            return {
                data: response.data as Order[],
                meta: {
                    current_page: 1,
                    last_page: 1,
                    per_page: response.data.length,
                    total: response.data.length,
                },
                links: {
                    first: null,
                    last: null,
                    prev: null,
                    next: null,
                }
            };
        }

        return {
            data: [],
            meta: {
                current_page: 1,
                last_page: 1,
                per_page: perPage,
                total: 0,
            },
            links: {
                first: null,
                last: null,
                prev: null,
                next: null,
            }
        };
    }
};
