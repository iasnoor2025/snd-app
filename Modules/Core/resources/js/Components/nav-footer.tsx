import { type NavItem } from '@/Core/types';
import { Link } from '@inertiajs/react';
import { type ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icon';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const { t } = useTranslation(['common']);

    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
            <>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                            >
                                <a href={item.href} target="_blank" rel="noopener noreferrer">
                                    {item.icon && <Icon name={item.icon.toLowerCase()} className="h-5 w-5" />}
                                    <span>{t(`footer.${item.title.toLowerCase().replace(' ', '_')}`, { defaultValue: item.title })}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/settings">
                                <Icon name="settings" />
                                {t('navigation.settings')}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </>
        </SidebarGroup>
    );
}

// Default export for compatibility with index.ts
export default NavFooter;
