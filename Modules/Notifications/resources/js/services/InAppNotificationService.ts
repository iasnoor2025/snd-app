import axios from 'axios';
import { InAppNotification } from '../types';

export const InAppNotificationService = {
    async getAll(): Promise<InAppNotification[]> {
        const { data } = await axios.get('/api/v1/notifications/in-app');
        return data.data;
    },
    async markAsRead(id: number): Promise<void> {
        await axios.post(`/api/v1/notifications/in-app/${id}/read`);
    },
    async clearAll(): Promise<void> {
        await axios.delete('/api/v1/notifications/in-app/clear');
    },
};
