import axios from 'axios';
import { Webhook } from '../types';

export const WebhookService = {
    async getAll(): Promise<Webhook[]> {
        const { data } = await axios.get('/api/settings/webhooks');
        return data.data;
    },
    async get(id: number): Promise<Webhook> {
        const { data } = await axios.get(`/api/settings/webhooks/${id}`);
        return data.data;
    },
    async create(payload: Partial<Webhook>): Promise<Webhook> {
        const { data } = await axios.post('/api/settings/webhooks', payload);
        return data.data;
    },
    async update(id: number, payload: Partial<Webhook>): Promise<Webhook> {
        const { data } = await axios.put(`/api/settings/webhooks/${id}`, payload);
        return data.data;
    },
    async delete(id: number): Promise<void> {
        await axios.delete(`/api/settings/webhooks/${id}`);
    },
};
