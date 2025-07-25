import { Badge } from '@/Core';
import { usePWA } from '@/hooks/usePWA';
import { Link } from '@inertiajs/react';
import { Bell, Download, Smartphone } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PWAMenuItemProps {
    className?: string;
    showBadges?: boolean;
}

const PWAMenuItem: React.FC<PWAMenuItemProps> = ({ className = '', showBadges = true }) => {
    const { isOnline, isInstallable, isStandalone, notificationPermission, serviceWorkerStatus } = usePWA();
    const { t } = useTranslation(['common']);

    const getStatusBadges = () => {
        const badges = [];

        // Offline status
        if (!isOnline) {
            badges.push(
                <Badge key="offline" variant="destructive" className="text-xs">
                    {t('pwa.offline')}
                </Badge>,
            );
        }

        // Installable status
        if (isInstallable && !isStandalone) {
            badges.push(
                <Badge key="installable" variant="secondary" className="text-xs">
                    <Download className="mr-1 h-3 w-3" />
                    {t('pwa.install')}
                </Badge>,
            );
        }

        // Notification permission status
        if (notificationPermission === 'default') {
            badges.push(
                <Badge key="notifications" variant="outline" className="text-xs">
                    <Bell className="mr-1 h-3 w-3" />
                    {t('pwa.enable')}
                </Badge>,
            );
        }

        // Service worker update available
        if (serviceWorkerStatus === 'waiting') {
            badges.push(
                <Badge key="update" variant="default" className="bg-blue-600 text-xs">
                    {t('pwa.update')}
                </Badge>,
            );
        }

        return badges;
    };

    const statusBadges = showBadges ? getStatusBadges() : [];

    return (
        <Link
            href="/pwa"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary ${className}`}
        >
            <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>{t('pwa.management')}</span>
            </div>

            {statusBadges.length > 0 && (
                <div className="ml-auto flex items-center gap-1">
                    {statusBadges.slice(0, 2)} {/* Show max 2 badges */}
                    {statusBadges.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{statusBadges.length - 2}
                        </Badge>
                    )}
                </div>
            )}

            {/* Connection status indicator */}
            <div className="ml-auto flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                {isStandalone && <Smartphone className="h-3 w-3 text-blue-600" title={t('pwa.running_as_app')} />}
            </div>
        </Link>
    );
};

export default PWAMenuItem;
