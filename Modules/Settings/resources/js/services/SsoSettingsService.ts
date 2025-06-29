import axios from 'axios';
import { SsoSetting } from '../types';

export const SsoSettingsService = {
  async getAll(): Promise<SsoSetting[]> {
    const { data } = await axios.get('/api/settings/sso');
    return data.data;
  },
  async get(id: number): Promise<SsoSetting> {
    const { data } = await axios.get(`/api/settings/sso/${id}`);
    return data.data;
  },
  async create(payload: Partial<SsoSetting>): Promise<SsoSetting> {
    const { data } = await axios.post('/api/settings/sso', payload);
    return data.data;
  },
  async update(id: number, payload: Partial<SsoSetting>): Promise<SsoSetting> {
    const { data } = await axios.put(`/api/settings/sso/${id}`, payload);
    return data.data;
  },
  async delete(id: number): Promise<void> {
    await axios.delete(`/api/settings/sso/${id}`);
  },
};
