import { Link } from '@inertiajs/react';
import { cn } from '../lib/utils';
import { Icon } from './icon';
import { 
    User, 
    Lock, 
    Bell, 
    Shield, 
    Palette,
    CreditCard,
    Activity
} from 'lucide-react';

interface ProfileNavProps {
    className?: string;
}

export function ProfileNav({ className }: ProfileNavProps) {
    const items = [
        {
            title: 'Profile Information',
            href: route('profile.settings', { tab: 'profile' }),
            icon: User
        },
        {
            title: 'Security',
            href: route('profile.settings', { tab: 'security' }),
            icon: Lock
        },
        {
            title: 'Appearance',
            href: route('profile.settings', { tab: 'appearance' }),
            icon: Palette
        },
        {
            title: 'Notifications',
            href: route('profile.settings', { tab: 'notifications' }),
            icon: Bell
        },
        {
            title: 'Privacy',
            href: route('profile.settings', { tab: 'privacy' }),
            icon: Shield
        },
        {
            title: 'Billing',
            href: route('profile.settings', { tab: 'billing' }),
            icon: CreditCard
        },
        {
            title: 'Activity Log',
            href: route('profile.settings', { tab: 'activity' }),
            icon: Activity
        }
    ];

    return (
        <nav className={cn("flex flex-col space-y-1", className)}>
            {items.map((item) => (
                <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        route().current('profile.settings', { tab: item.title.toLowerCase() })
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                </Link>
            ))}
        </nav>
    );
} 