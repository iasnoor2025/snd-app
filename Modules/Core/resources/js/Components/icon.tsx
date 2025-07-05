import { cn } from '../lib/utils';
import { type LucideProps } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { type ComponentType } from 'react';

interface IconProps extends Omit<LucideProps, 'ref'> {
    name: string;
}

const iconMap: Record<string, ComponentType<LucideProps>> = {
    'bar-chart': LucideIcons.BarChart,
    'book-open': LucideIcons.BookOpen,
    'briefcase': LucideIcons.Briefcase,
    'calendar': LucideIcons.Calendar,
    'clipboard-list': LucideIcons.ClipboardList,
    'clock': LucideIcons.Clock,
    'dollar-sign': LucideIcons.DollarSign,
    'file-digit': LucideIcons.FileDigit,
    'folder-check': LucideIcons.FolderCheck,
    'globe': LucideIcons.Globe,
    'help-circle': LucideIcons.HelpCircle,
    'layout-grid': LucideIcons.LayoutGrid,
    'network': LucideIcons.Network,
    'settings': LucideIcons.Settings,
    'shield': LucideIcons.Shield,
    'smartphone': LucideIcons.Smartphone,
    'truck': LucideIcons.Truck,
    'user': LucideIcons.User,
    'user-cog': LucideIcons.UserCog,
    'users': LucideIcons.Users,
    'bell': LucideIcons.Bell,
    'home': LucideIcons.Home,
};

export function Icon({ name, className, ...props }: IconProps) {
    const IconComponent = iconMap[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in iconMap`);
        return null;
    }

    return <IconComponent className={cn('h-4 w-4', className)} {...props} />;
}
