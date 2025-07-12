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
    const currentTab = route().params.tab?.toLowerCase() || 'profile';
    const items = [
        {
            title: 'Profile Information',
            href: route('profile.settings', { tab: 'profile' }),
            icon: User,
            tab: 'profile',
        },
        {
            title: 'Security',
            href: route('profile.settings', { tab: 'security' }),
            icon: Lock,
            tab: 'security',
        },
        {
            title: 'Appearance',
            href: route('profile.settings', { tab: 'appearance' }),
            icon: Palette,
            tab: 'appearance',
        },
        {
            title: 'Notifications',
            href: route('profile.settings', { tab: 'notifications' }),
            icon: Bell,
            tab: 'notifications',
        },
        {
            title: 'Privacy',
            href: route('profile.settings', { tab: 'privacy' }),
            icon: Shield,
            tab: 'privacy',
        },
        {
            title: 'Activity Log',
            href: route('profile.settings', { tab: 'activity' }),
            icon: Activity,
            tab: 'activity',
        },
    ];

    return (
        <nav className={cn("flex flex-col space-y-1", className)} aria-label="Profile Settings Navigation">
            {items.map((item) => {
                const isActive = currentTab === item.tab;
                return (
                    <Link
                        key={item.title}
                        href={item.href}
                        tabIndex={0}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                            isActive
                                ? "bg-accent text-accent-foreground font-semibold"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                        {isActive && (
                            <span className="sr-only">(Current tab)</span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
