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
    normal_price?: number | string | null;
    promo_price?: number | string | null;
    features: string[] | string; // API might return JSON string or array
    target_audience?: string[];
    included_features?: string[];
    thumbnail: string;
    full_thumbnail_url: string;
    preview_url?: string;
    preview_pages?: Array<{ label?: string; path?: string }> | string | null;
    preview_gallery?: string[] | string | null;
    is_active: boolean;
    sector_id: number;
    sector?: Sector;
}

export interface TemplateReview {
    id: number;
    rating: number;
    content: string;
    reviewer_name: string;
    reviewer_role: string;
    template: {
        id: number;
        name: string;
        slug: string;
    } | null;
    created_at: string;
    approved_at?: string | null;
    is_featured: boolean;
}

export interface FaqItem {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
}

export interface PublicPricingPlan {
    name: string;
    price: number;
    billing_label: string;
    cta_label: string;
    features: string[];
    badge_label?: string;
}

export interface PublicPricingConfig {
    currency_label: string;
    section_title: string;
    section_description: string;
    custom_note: string;
    starting_price: number;
    standard: PublicPricingPlan;
    premium: PublicPricingPlan;
}

export interface TemplateReviewSummary {
    count: number;
    average_rating: number | null;
}

export interface TemplateReviewListResponse {
    summary: TemplateReviewSummary;
    data: TemplateReview[];
}

export interface TemplateReviewEligibility {
    can_review: boolean;
    message: string;
    eligible_order_id: number | null;
    existing_review: {
        id: number;
        rating: number;
        content: string;
        status: 'pending' | 'approved' | 'rejected';
        is_featured: boolean;
        updated_at: string;
    } | null;
}

export interface CreateTemplateReviewPayload {
    rating: number;
    content: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'awaiting_payment' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'expired';

export interface PaymentInfo {
    id: number;
    provider: string;
    status: string;
    mode: string | null;
    reference: string | null;
    checkout_url: string | null;
    fedapay_transaction_id: number | null;
    initiated_at?: string | null;
    completed_at?: string | null;
}

export interface OrderInstruction {
    id?: number;
    enterprise_name: string | null;
    activity_description: string | null;
    colors: string[];
    specific_instructions: string | null;
}

export interface OrderOption {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    persona_hint: string | null;
    price: number;
}

export interface SelectedOrderOption {
    id: number | null;
    name: string;
    price: number;
}

export interface Order {
    id: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    paid_at?: string | null;
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
    selected_options?: SelectedOrderOption[];
    payment?: PaymentInfo | null;
    // Backward compatibility with older payloads
    instructions?: OrderInstruction[];
    preview_url: string | null;
    client_feedback: string | null;
    feedback_submitted_at: string | null;
    site_url: string | null;
    domain: string | null;
    hosting_expires_at: string | null;
}

export interface OrderSummary {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
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

export interface OrderListFilters {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
}

export interface CreateOrderPayload {
    template_id: string | null;
    enterprise_name?: string;
    activity_description?: string;
    colors?: string[];
    specific_instructions?: string;
    option_ids?: number[];
}

export interface InitiateOrderPaymentPayload {
    mode?: string;
    phone_number?: {
        number: string;
        country: string;
    };
}

export interface OrderPaymentResponse {
    order: {
        id: number;
        status: OrderStatus;
        payment_status: PaymentStatus;
        paid_at: string | null;
        price: number;
    };
    payment: PaymentInfo | null;
    already_paid?: boolean;
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

    async getFeaturedTestimonials(limit = 3): Promise<TemplateReview[]> {
        const response = await api.get('/testimonials', {
            params: { limit },
        });
        return Array.isArray(response.data) ? response.data as TemplateReview[] : [];
    },

    async getFaqs(limit?: number): Promise<FaqItem[]> {
        const params = typeof limit === 'number' ? { limit } : undefined;
        const response = await api.get('/faqs', { params });
        return Array.isArray(response.data) ? response.data as FaqItem[] : [];
    },

    async getPublicPricing(): Promise<PublicPricingConfig> {
        const response = await api.get('/public/pricing');
        return response.data as PublicPricingConfig;
    },

    async getOrderOptions(): Promise<OrderOption[]> {
        const response = await api.get('/order-options');
        return Array.isArray(response.data) ? response.data as OrderOption[] : [];
    },

    async getTemplateReviews(templateId: number | string): Promise<TemplateReviewListResponse> {
        const response = await api.get(`/templates/${templateId}/reviews`);
        return response.data as TemplateReviewListResponse;
    },

    async getTemplateReviewEligibility(templateId: number | string): Promise<TemplateReviewEligibility> {
        const response = await api.get(`/templates/${templateId}/review-eligibility`);
        return response.data as TemplateReviewEligibility;
    },

    async submitTemplateReview(templateId: number | string, payload: CreateTemplateReviewPayload): Promise<{
        message: string;
        review: {
            id: number;
            rating: number;
            content: string;
            status: 'pending' | 'approved' | 'rejected';
            updated_at: string;
        };
    }> {
        const response = await api.post(`/templates/${templateId}/reviews`, payload);
        return response.data as {
            message: string;
            review: {
                id: number;
                rating: number;
                content: string;
                status: 'pending' | 'approved' | 'rejected';
                updated_at: string;
            };
        };
    },

    async createOrder(data: CreateOrderPayload): Promise<Order> {
        const response = await api.post('/orders', data);
        return response.data;
    },

    async getOrders(page = 1, perPage = 10, filters: OrderListFilters = {}): Promise<PaginatedResponse<Order>> {
        const response = await api.get('/orders', {
            params: {
                page,
                per_page: perPage,
                ...filters,
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
    },

    async getOrder(orderId: number | string): Promise<Order> {
        const response = await api.get(`/orders/${orderId}`);
        return response.data as Order;
    },

    async initiateOrderPayment(orderId: number | string, payload: InitiateOrderPaymentPayload = {}): Promise<OrderPaymentResponse> {
        const response = await api.post(`/orders/${orderId}/payment-link`, payload);
        return response.data as OrderPaymentResponse;
    },

    async getOrderPaymentStatus(orderId: number | string, refresh = false): Promise<OrderPaymentResponse> {
        const response = await api.get(`/orders/${orderId}/payment-status`, {
            params: { refresh: refresh ? 1 : 0 },
        });
        return response.data as OrderPaymentResponse;
    },

    async getOrderSummary(): Promise<OrderSummary> {
        const response = await api.get('/orders/summary');
        return response.data as OrderSummary;
    },

    async submitOrderFeedback(orderId: number, feedback: string): Promise<Order> {
        const response = await api.post(`/orders/${orderId}/feedback`, { feedback });
        return response.data as Order;
    },
};
