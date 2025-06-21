import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '../../lib/utils';

const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-24 w-24 text-2xl',
};

const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
};

const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export const SmartAvatar = ({
    user,
    size = 'md',
    status,
    badge,
    className,
    fallback,
    ...props
}) => {
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const avatarUrl = user?.avatar_url || user?.avatar;
    const [imgError, setImgError] = React.useState(false);

    // Reset error state when avatarUrl changes
    React.useEffect(() => {
        setImgError(false);
    }, [avatarUrl]);

    return (
        <div className="relative inline-block">
            <Avatar className={cn(sizeClass, className)} {...props}>
                {!imgError && avatarUrl && (
                    <AvatarImage 
                        src={avatarUrl} 
                        alt={user?.name}
                        onError={(e) => {
                            e.currentTarget.onerror = null; // Prevent infinite loop
                            setImgError(true);
                        }}
                    />
                )}
                {(imgError || !avatarUrl) && user?.laravolt_avatar && (
                    <AvatarImage 
                        src={user.laravolt_avatar} 
                        alt={user?.name}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = user?.gravatar_url;
                        }}
                    />
                )}
                <AvatarFallback 
                    className="bg-primary/10 text-primary"
                    style={{ backgroundColor: user?.avatar_color }}
                >
                    {fallback || user?.initials || getInitials(user?.name)}
                </AvatarFallback>
            </Avatar>

            {/* Status Indicator */}
            {status && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900',
                        'h-2.5 w-2.5',
                        statusColors[status]
                    )}
                />
            )}

            {/* Custom Badge */}
            {badge && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-white dark:bg-gray-900 p-0.5">
                    {badge}
                </div>
            )}
        </div>
    );
};

export const UserAvatar = ({ user, ...props }) => {
    return (
        <SmartAvatar
            user={user}
            fallback={user?.initials || getInitials(user?.name)}
            {...props}
        />
    );
};

export const TeamAvatar = ({ team, ...props }) => {
    return (
        <SmartAvatar
            user={{ 
                name: team?.name, 
                avatar_url: team?.avatar,
                initials: getInitials(team?.name),
                avatar_color: '#' + Math.floor(Math.random()*16777215).toString(16)
            }}
            fallback={getInitials(team?.name)}
            {...props}
        />
    );
}; 