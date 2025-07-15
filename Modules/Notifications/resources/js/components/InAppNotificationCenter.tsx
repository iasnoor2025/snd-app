import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { InAppNotificationService } from '../services/InAppNotificationService';
import { InAppNotification } from '../types';

export default function InAppNotificationCenter() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            setNotifications(await InAppNotificationService.getAll());
        } catch {
            toast.error(t('notifications:center.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchNotifications();
    }, [open]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await InAppNotificationService.markAsRead(id);
            fetchNotifications();
        } catch {
            toast.error(t('notifications:center.mark_error'));
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm(t('notifications:center.clear_confirm'))) return;
        try {
            await InAppNotificationService.clearAll();
            fetchNotifications();
            toast.success(t('notifications:center.cleared'));
        } catch {
            toast.error(t('notifications:center.clear_error'));
        }
    };

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <div className="relative inline-block">
            <button className="btn btn-ghost" onClick={() => setOpen((o) => !o)}>
                <span className="icon-bell" />
                {unreadCount > 0 && <span className="badge badge-error ml-1">{unreadCount}</span>}
            </button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b p-4">
                        <span className="font-bold">{t('notifications:center.title')}</span>
                        <button className="btn btn-xs btn-danger" onClick={handleClearAll}>
                            {t('notifications:center.clear')}
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4">{t('notifications:center.loading')}</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4">{t('notifications:center.empty')}</div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className={`border-b p-4 ${n.read_at ? 'bg-gray-100' : 'bg-white'}`}>
                                    <div className="font-semibold">{n.type}</div>
                                    <div className="text-sm text-gray-600">{n.data?.message || JSON.stringify(n.data)}</div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">{new Date(n.created_at)}</span>
                                        {!n.read_at && (
                                            <button className="btn btn-xs btn-primary" onClick={() => handleMarkAsRead(n.id)}>
                                                {t('notifications:center.mark')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
