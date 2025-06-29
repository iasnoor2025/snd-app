import axios from 'axios';
import { NotificationTemplate } from '../types';

export const NotificationTemplateService = {
  async getAll(): Promise<NotificationTemplate[]> {
    const { data } = await axios.get('/api/notifications/templates');
    return data.data;
  },
  async get(id: number): Promise<NotificationTemplate> {
    const { data } = await axios.get(`/api/notifications/templates/${id}`);
    return data.data;
  },
  async create(payload: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const { data } = await axios.post('/api/notifications/templates', payload);
    return data.data;
  },
  async update(id: number, payload: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const { data } = await axios.put(`/api/notifications/templates/${id}`, payload);
    return data.data;
  },
  async delete(id: number): Promise<void> {
    await axios.delete(`/api/notifications/templates/${id}`);
  },
};
