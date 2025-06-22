import { Icon } from "./icon";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "./ui/sidebar";
import { Link, usePage } from "@inertiajs/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useTranslation } from "react-i18next";
import { type NavItem } from "@/Core/types";
import { usePermission } from "../hooks/usePermission";

interface NavMainProps {
    items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
    const { t } = useTranslation('common');
    const { hasPermission } = usePermission();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t('navigation.navigation')}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item, index) => {
                    if (item.permission && !hasPermission(item.permission)) {
                        return null;
                    }

                    if (item.items) {
                        return (
                            <SidebarMenuItem key={index}>
                                <Collapsible>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton>
                                            {item.icon && <Icon name={item.icon} className="h-4 w-4 mr-2" />}
                                            {item.title}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((child, childIndex) => {
                                                if (child.permission && !hasPermission(child.permission)) {
                                                    return null;
                                                }

                                                return (
                                                    <SidebarMenuSubItem key={childIndex}>
                                                        <SidebarMenuSubButton asChild>
                                                            <Link href={child.href}>
                                                                {child.icon && <Icon name={child.icon} className="h-4 w-4 mr-2" />}
                                                                {child.title}
                                                            </Link>
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
                            <SidebarMenuButton asChild>
                                <Link href={item.href}>
                                    {item.icon && <Icon name={item.icon} className="h-4 w-4 mr-2" />}
                                    {item.title}
                                </Link>
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























