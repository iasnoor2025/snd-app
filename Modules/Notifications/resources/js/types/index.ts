export interface DevicePushToken {
    id: number;
    user_id: number;
    token: string;
    platform: string;
    last_active_at?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface InAppNotification {
    id: number;
    user_id: number;
    type: string;
    data: Record<string, any>;
    read_at?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface NotificationTemplate {
    id: number;
    name: string;
    type: string;
    subject?: string | null;
    body: string;
    variables: Record<string, any>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface ScheduledNotification {
    id: number;
    user_id?: number | null;
    template_id: number;
    send_at: string;
    status: string;
    payload: Record<string, any>;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}
