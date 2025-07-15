import { type NavItem } from '@/Core/types';
import { router } from '@inertiajs/core';
import { useTranslation } from 'react-i18next';
import { usePermission } from '../hooks/usePermission';
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
} from './ui/sidebar';

interface NavMainProps {
    items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
    const { t } = useTranslation('common');
    const { hasPermission } = usePermission();

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

                    if (item.items) {
                        return (
                            <SidebarMenuItem key={index}>
                                <Collapsible>
                                    <CollapsibleTrigger>
                                        <SidebarMenuButton onClick={() => router.visit(item.href)} className="w-full text-left">
                                            {item.icon && <Icon name={item.icon} className="mr-2 h-4 w-4" />}
                                            {item.title}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((child, childIndex) => {
                                                // Temporarily disable permission checks for debugging
                                                // if (child.permission && !hasPermission(child.permission)) {
                                                //     return null;
                                                // }

                                                return (
                                                    <SidebarMenuSubItem key={childIndex}>
                                                        <SidebarMenuSubButton onClick={() => router.visit(child.href)} className="w-full text-left">
                                                            {child.title}
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
                                className="flex w-full items-center text-left"
                            >
                                {item.icon && <Icon name={item.icon} className="mr-2 h-4 w-4" />}
                                {item.title}
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
