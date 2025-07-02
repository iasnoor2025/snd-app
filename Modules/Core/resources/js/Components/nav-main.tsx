import { Icon } from "./icon";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "./ui/sidebar";
import { router } from "@inertiajs/core";
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

    console.log('NavMain received items:', items); // Debug log

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t('navigation.navigation')}</SidebarGroupLabel>
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
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton>
                                            {item.icon && <Icon name={item.icon} className="h-4 w-4 mr-2" />}
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
                                                        <SidebarMenuSubButton asChild>
                                                            <button
                                                                onClick={() => router.visit(child.href)}
                                                                className="w-full text-left"
                                                            >
                                                                {child.title}
                                                            </button>
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
                                <button
                                    onClick={() => router.visit(item.href)}
                                    className="w-full text-left flex items-center"
                                >
                                    {item.icon && <Icon name={item.icon} className="h-4 w-4 mr-2" />}
                                    {item.title}
                                </button>
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























