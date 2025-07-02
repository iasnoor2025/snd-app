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

    console.log('NavMain: Received items:', items);
    console.log('NavMain: Items count:', items.length);

    if (!items || items.length === 0) {
        console.log('NavMain: No items to render');
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
                    console.log('NavMain: Rendering item:', item.title, 'at index:', index);

                    // Temporarily disable permission checks for debugging
                    // if (item.permission && !hasPermission(item.permission)) {
                    //     console.log('NavMain: Permission denied for:', item.title);
                    //     return null;
                    // }

                    if (item.items) {
                        return (
                            <SidebarMenuItem key={index}>
                                <Collapsible>
                                    <CollapsibleTrigger>
                                        <SidebarMenuButton onClick={() => router.visit(item.href)} className="w-full text-left">
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
                            <SidebarMenuButton onClick={() => {
                                console.log('NavMain: Clicking on:', item.title, 'href:', item.href);
                                router.visit(item.href);
                            }} className="w-full text-left flex items-center">
                                {item.icon && <Icon name={item.icon} className="h-4 w-4 mr-2" />}
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























