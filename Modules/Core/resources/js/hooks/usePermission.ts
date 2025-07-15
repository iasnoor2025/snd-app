import { usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    permissions: string[];
    roles: string[];
}

interface Auth {
    user: User;
}

/**
 * Custom hook for checking user permissions and roles
 */
export function usePermission(p0?: string) {
    const props = usePage().props as unknown;
    const auth = props && typeof props === 'object' && 'auth' in props ? ((props as any).auth as Auth) : undefined;

    // Support both string and object arrays for roles/permissions
    const roles = auth?.user?.roles || [];
    const permissions = auth?.user?.permissions || [];

    const hasRole = (role: string): boolean => {
        if (!roles) return false;
        return Array.isArray(roles) && roles.some((r) => r === role || (r && typeof r === 'object' && r.name === role));
    };

    const isAdmin = hasRole('admin') || hasRole('Admin') || hasRole('super-admin') || hasRole('Super Admin');

    const hasPermission = (permission: string): boolean => {
        if (!permissions) return false;
        if (isAdmin) return true;
        return Array.isArray(permissions) && permissions.some((p) => p === permission || (p && typeof p === 'object' && p.name === permission));
    };

    return {
        hasPermission,
        hasRole,
        user: auth?.user,
        isAdmin,
    };
}
