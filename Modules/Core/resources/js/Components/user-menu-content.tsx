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
                        {t('navigation.profile')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings" onClick={closeMobileNavigation}>
                        <Icon name="settings" />
                        {t('navigation.settings')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Globe className="mr-2" />
                    <LanguageSwitcher />
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href={route('logout')} method="post" as="button" onClick={closeMobileNavigation}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('navigation.logout')}
                </Link>
            </DropdownMenuItem>
        </>
    );
}






















