import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SmartAvatar } from '@/components/ui/smart-avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

interface UserInfoProps {
    user: User;
    showEmail?: boolean;
    useSmartAvatar?: boolean;
    avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function UserInfo({
    user,
    showEmail = false,
    useSmartAvatar = false,
    avatarSize = 'sm'
}: UserInfoProps) {
    const getInitials = useInitials();

    return (
        <>
            {useSmartAvatar ? (
                <SmartAvatar
                    user={{
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar
                    }}
                    size={avatarSize}
                    className="overflow-hidden rounded-full"
                />
            ) : (
                <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
            )}
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
            </div>
        </>
    );
}
