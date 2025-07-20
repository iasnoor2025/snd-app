import { type SharedData } from '@/Core/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar';
import { UserInfo } from './user-info';
import { UserMenuContent } from './user-menu-content';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { isCollapsed } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                        >
                            <UserInfo user={auth.user} showName={!isCollapsed} />
                            {!isCollapsed && <ChevronsUpDown className="ml-auto size-4" />}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[var(--sidebar-width)]"
                        align="end"
                        side={isMobile ? 'bottom' : 'bottom'}
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

// Default export for compatibility with index.ts
export default NavUser;
