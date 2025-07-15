import axios from 'axios';

export const SmsNotificationService = {
    async sendTest(to: string, message: string): Promise<void> {
        await axios.post('/api/notifications/sms/test', { to, message });
    },
};
