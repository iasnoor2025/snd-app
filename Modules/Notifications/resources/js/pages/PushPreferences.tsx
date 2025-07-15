import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PushNotificationService } from '../services/PushNotificationService';

export default function PushPreferences() {
    const { t } = useTranslation();
    const [token, setToken] = useState('');
    const [platform, setPlatform] = useState('web');
    const [registered, setRegistered] = useState(false);
    const [testTitle, setTestTitle] = useState('Test Notification');
    const [testBody, setTestBody] = useState('This is a test push notification.');

    const handleRegister = async () => {
        try {
            // In real app, get token from push provider (e.g., FCM)
            if (!token) {
                toast.error(t('notifications:push.enter_token'));
                return;
            }
            await PushNotificationService.registerToken(token, platform);
            setRegistered(true);
            toast.success(t('notifications:push.registered'));
        } catch {
            toast.error(t('notifications:push.register_error'));
        }
    };

    const handleTest = async () => {
        try {
            await PushNotificationService.sendTest(token, testTitle, testBody);
            toast.success(t('notifications:push.test_sent'));
        } catch {
            toast.error(t('notifications:push.test_error'));
        }
    };

    return (
        <div>
            <h2 className="mb-4 text-xl font-bold">{t('notifications:push.title')}</h2>
            <div className="mb-4">
                <label>{t('notifications:push.token')}</label>
                <input value={token} onChange={(e) => setToken(e.target.value)} className="input input-bordered w-full" />
            </div>
            <div className="mb-4">
                <label>{t('notifications:push.platform')}</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input input-bordered w-full">
                    <option value="web">Web</option>
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                </select>
            </div>
            <button className="btn btn-primary mb-4" onClick={handleRegister}>
                {t('notifications:push.register')}
            </button>
            {registered && (
                <div className="mt-6">
                    <h3 className="mb-2 font-semibold">{t('notifications:push.send_test')}</h3>
                    <div className="mb-2">
                        <label>{t('notifications:push.test_title')}</label>
                        <input value={testTitle} onChange={(e) => setTestTitle(e.target.value)} className="input input-bordered w-full" />
                    </div>
                    <div className="mb-2">
                        <label>{t('notifications:push.test_body')}</label>
                        <input value={testBody} onChange={(e) => setTestBody(e.target.value)} className="input input-bordered w-full" />
                    </div>
                    <button className="btn btn-secondary" onClick={handleTest}>
                        {t('notifications:push.send')}
                    </button>
                </div>
            )}
        </div>
    );
}
