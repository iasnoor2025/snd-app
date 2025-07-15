import { usePermission } from '@/Core';
import React from 'react';

interface PermissionProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const Permission: React.FC<PermissionProps> = ({ permission, children, fallback = null }) => {
    const { hasPermission } = usePermission();

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default Permission;
