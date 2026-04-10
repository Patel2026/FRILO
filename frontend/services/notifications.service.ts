import api from './api';

export const NOTIFICATIONS_UPDATED_EVENT = 'frilo-notifications-updated';

function emitNotificationsUpdated() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    }
}

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    action_url: string | null;
    action_label: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string | null;
    data: Record<string, unknown>;
}

export interface NotificationListResponse {
    data: NotificationItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    unread_count: number;
}

export interface NotificationReadResponse {
    notification: NotificationItem;
    unread_count: number;
}

export interface NotificationReadAllResponse {
    marked_all_read: boolean;
    unread_count: number;
}

export const notificationsService = {
    async getNotifications(page = 1, perPage = 20): Promise<NotificationListResponse> {
        const response = await api.get('/notifications', {
            params: {
                page,
                per_page: perPage,
            },
        });

        return response.data as NotificationListResponse;
    },

    async getUnreadCount(): Promise<number> {
        const response = await api.get('/notifications/unread-count');
        return Number(response.data?.unread_count ?? 0);
    },

    async markAsRead(notificationId: string): Promise<NotificationReadResponse> {
        const response = await api.post(`/notifications/${notificationId}/read`);
        emitNotificationsUpdated();
        return response.data as NotificationReadResponse;
    },

    async markAllAsRead(): Promise<NotificationReadAllResponse> {
        const response = await api.post('/notifications/read-all');
        emitNotificationsUpdated();
        return response.data as NotificationReadAllResponse;
    },
};

