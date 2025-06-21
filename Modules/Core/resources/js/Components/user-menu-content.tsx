import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { UserInfo } from "./user-info";
import { useMobileNavigation } from "../hooks/use-mobile-navigation";
import { useTranslation } from "react-i18next";
import { Link } from "@inertiajs/react";
import { Icon } from "./icon";
import { LogOut, Settings, Globe } from 'lucide-react';
import LanguageSwitcher from "./LanguageSwitcher";

export function UserMenuContent() {
    const { t } = useTranslation(['common']);
    const { closeMobileNavigation } = useMobileNavigation();

    const handleLogout = () => {
        closeMobileNavigation();
        // Assuming you're using a router instance to handle logout
        // Replace this with the actual logout logic
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link href="/profile" onClick={closeMobileNavigation}>
                        <Icon name="user" />
                        {t('common:profile')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings" onClick={closeMobileNavigation}>
                        <Icon name="settings" />
                        {t('common:settings')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Globe className="mr-2" />
                    <LanguageSwitcher />
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/logout" method="post" as="button" onClick={handleLogout}>
                    <Icon name="logout" />
                    {t('common:logout')}
                </Link>
            </DropdownMenuItem>
        </>
    );
}






















