export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string;
    is_active: boolean;
    last_login_at: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: Array<{
        id: number;
        name: string;
    }>;
    permissions?: string[];
    initials?: string;
    avatar_color?: string;
    laravolt_avatar?: string;
    gravatar_url?: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: string;
    permission?: string;
    items?: NavItem[];
}

export interface BreadcrumbItem {
    title: string;
    href?: string;
}

export interface SharedData {
    auth: {
        user: User;
    };
    sidebarOpen?: boolean;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
}
