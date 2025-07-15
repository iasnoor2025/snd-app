import { type SharedData } from '@/Core/types';
import { usePage } from '@inertiajs/react';
import { useInitials } from '../hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SmartAvatar } from './ui/smart-avatar';

export function UserInfo() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const initials = getInitials(auth.user.name);

    return (
        <div className="flex items-center gap-2">
            <SmartAvatar>
                <Avatar>
                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            </SmartAvatar>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{auth.user.name}</span>
                <span className="text-xs text-muted-foreground">{auth.user.email}</span>
            </div>
        </div>
    );
}
