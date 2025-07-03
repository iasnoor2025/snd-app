import { Breadcrumbs } from './breadcrumbs';
import { SidebarTrigger } from './ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '../types';
import { useTheme } from './theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { theme, setTheme } = useTheme();
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    const icon = theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />;

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <button
                className="ml-auto flex items-center justify-center rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={`Switch theme (current: ${theme})`}
                onClick={() => setTheme(nextTheme)}
            >
                {icon}
            </button>
        </header>
    );
}





















