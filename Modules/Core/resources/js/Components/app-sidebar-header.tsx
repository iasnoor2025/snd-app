import { Monitor, Moon, Sun } from 'lucide-react';
import { type BreadcrumbItem as BreadcrumbItemType } from '../types';
import { Breadcrumbs } from './breadcrumbs';
import { useTheme } from './theme-provider';
import { SidebarTrigger } from './ui/sidebar';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { theme, setTheme } = useTheme();
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    const icon = theme === 'light' ? <Sun className="h-5 w-5" /> : theme === 'dark' ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />;

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 bg-white px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <button
                    className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={`Switch theme (current: ${theme})`}
                    onClick={() => setTheme(nextTheme)}
                >
                    {icon}
                </button>
                <SidebarTrigger />
            </div>
        </header>
    );
}
