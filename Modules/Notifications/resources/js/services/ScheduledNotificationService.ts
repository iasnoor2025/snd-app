import axios from 'axios';
import { ScheduledNotification } from '../types';

export const ScheduledNotificationService = {
    async getAll(): Promise<ScheduledNotification[]> {
        const { data } = await axios.get('/api/v1/notifications/scheduled');
        return data.data;
    },
    async create(payload: Partial<ScheduledNotification>): Promise<ScheduledNotification> {
        const { data } = await axios.post('/api/v1/notifications/scheduled', payload);
        return data.data;
    },
    async cancel(id: number): Promise<void> {
        await axios.post(`/api/v1/notifications/scheduled/${id}/cancel`);
    },
};
