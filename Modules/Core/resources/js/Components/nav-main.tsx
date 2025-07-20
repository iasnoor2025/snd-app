import { type NavItem } from '@/Core/types';
import { router } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { usePermission } from '../hooks/usePermission';
import { cn } from '../lib/utils';
import { Icon } from './icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from './ui/sidebar';

interface NavMainProps {
    items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
    const { t } = useTranslation('common');
    const { hasPermission } = usePermission();
    const { isCollapsed } = useSidebar();
    const page = usePage();
    const currentUrl = page.url;

    // Function to check if item is active
    const isActive = (href: string) => {
        // Check for exact match first
        if (currentUrl === href) return true;

        // Check if current URL starts with the item href (for nested routes)
        if (href !== '/' && currentUrl.startsWith(href)) return true;

        return false;
    };

    if (!items || items.length === 0) {
        return (
            <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>No items to display</SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        );
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item, index) => {
                    // Temporarily disable permission checks for debugging
                    // if (item.permission && !hasPermission(item.permission)) {
                    //     return null;
                    // }

                    const itemIsActive = isActive(item.href);

                    if (item.items && !isCollapsed) {
                        return (
                            <SidebarMenuItem key={index}>
                                <Collapsible>
                                    <CollapsibleTrigger>
                                        <SidebarMenuButton
                                            onClick={() => router.visit(item.href)}
                                            className={cn(
                                                "w-full text-left",
                                                itemIsActive && "bg-accent text-accent-foreground font-medium"
                                            )}
                                        >
                                            {item.icon && <Icon name={item.icon} className="h-4 w-4 shrink-0" />}
                                            {!isCollapsed && <span className="truncate">{item.title}</span>}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((child, childIndex) => {
                                                // Temporarily disable permission checks for debugging
                                                // if (child.permission && !hasPermission(child.permission)) {
                                                //     return null;
                                                // }

                                                const childIsActive = isActive(child.href);

                                                return (
                                                    <SidebarMenuSubItem key={childIndex}>
                                                        <SidebarMenuSubButton
                                                            onClick={() => router.visit(child.href)}
                                                            className={cn(
                                                                "w-full text-left",
                                                                childIsActive && "bg-accent text-accent-foreground font-medium"
                                                            )}
                                                        >
                                                            <span className="truncate">{child.title}</span>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <SidebarMenuItem key={index}>
                            <SidebarMenuButton
                                onClick={() => {
                                    router.visit(item.href);
                                }}
                                className={cn(
                                    "flex w-full items-center text-left",
                                    itemIsActive && "bg-accent text-accent-foreground font-medium"
                                )}
                                title={isCollapsed ? item.title : undefined} // Show tooltip when collapsed
                            >
                                {item.icon && <Icon name={item.icon} className="h-4 w-4 shrink-0" />}
                                {!isCollapsed && <span className="truncate">{item.title}</span>}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

// Default export for compatibility with index.ts
export default NavMain;
