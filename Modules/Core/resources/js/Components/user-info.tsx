import { type SharedData } from '@/Core/types';
import { usePage } from '@inertiajs/react';
import { useInitials } from '../hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SmartAvatar } from './ui/smart-avatar';

interface UserInfoProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    showName?: boolean;
}

export function UserInfo({ user, showName = true }: UserInfoProps) {
    const { auth } = usePage<SharedData>().props;
    const currentUser = user || auth.user;
    const getInitials = useInitials();
    // Defensive: handle guest (no user)
    if (!currentUser) {
        return (
            <div className="flex items-center gap-2">
                <SmartAvatar>
                    <Avatar>
                        <AvatarFallback>G</AvatarFallback>
                    </Avatar>
                </SmartAvatar>
                {showName && (
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">Guest</span>
                        <span className="text-xs text-muted-foreground truncate">&nbsp;</span>
                    </div>
                )}
            </div>
        );
    }
    const initials = getInitials(currentUser.name);
    return (
        <div className="flex items-center gap-2">
            <SmartAvatar>
                <Avatar>
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            </SmartAvatar>
            {showName && (
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{currentUser.email}</span>
                </div>
            )}
        </div>
    );
}
