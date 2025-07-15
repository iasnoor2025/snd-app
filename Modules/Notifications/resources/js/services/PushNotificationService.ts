import axios from 'axios';
import { DevicePushToken } from '../types';

export const PushNotificationService = {
    async registerToken(token: string, platform: string): Promise<DevicePushToken> {
        const { data } = await axios.post('/api/notifications/push/register', { token, platform });
        return data.data;
    },
    async sendTest(token: string, title: string, body: string): Promise<void> {
        await axios.post('/api/notifications/push/test', { token, title, body });
    },
};
