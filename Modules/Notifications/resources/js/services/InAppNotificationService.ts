import axios from 'axios';
import { InAppNotification } from '../types';

export const InAppNotificationService = {
    async getAll(): Promise<InAppNotification[]> {
        const { data } = await axios.get('/api/notifications/in-app');
        return data.data;
    },
    async markAsRead(id: number): Promise<void> {
        await axios.post(`/api/notifications/in-app/${id}/read`);
    },
    async clearAll(): Promise<void> {
        await axios.delete('/api/notifications/in-app/clear');
    },
};
