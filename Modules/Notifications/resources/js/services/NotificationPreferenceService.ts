import axios from 'axios';

export interface NotificationPreferences {
    email: boolean;
    sms: boolean;
    push: boolean;
    in_app: boolean;
}

export const NotificationPreferenceService = {
    async get(): Promise<NotificationPreferences> {
        const { data } = await axios.get('/api/v1/notifications/preferences');
        return data.data;
    },
    async update(prefs: NotificationPreferences): Promise<NotificationPreferences> {
        const { data } = await axios.post('/api/v1/notifications/preferences', prefs);
        return data.data;
    },
};
