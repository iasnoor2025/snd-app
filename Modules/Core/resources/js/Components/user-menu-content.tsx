import { Link } from '@inertiajs/react';
import { Globe, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMobileNavigation } from '../hooks/use-mobile-navigation';
import { Icon } from './icon';
import LanguageSwitcher from './LanguageSwitcher';
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { UserInfo } from './user-info';

interface UserMenuContentProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const { t } = useTranslation(['common']);
    const { closeMobileNavigation } = useMobileNavigation();

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} />
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
