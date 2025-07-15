import axios from 'axios';
import { PaymentGatewaySetting } from '../types';

export const PaymentGatewaySettingsService = {
    async getAll(): Promise<PaymentGatewaySetting[]> {
        const { data } = await axios.get('/api/settings/payment-gateways');
        return data.data;
    },
    async get(id: number): Promise<PaymentGatewaySetting> {
        const { data } = await axios.get(`/api/settings/payment-gateways/${id}`);
        return data.data;
    },
    async create(payload: Partial<PaymentGatewaySetting>): Promise<PaymentGatewaySetting> {
        const { data } = await axios.post('/api/settings/payment-gateways', payload);
        return data.data;
    },
    async update(id: number, payload: Partial<PaymentGatewaySetting>): Promise<PaymentGatewaySetting> {
        const { data } = await axios.put(`/api/settings/payment-gateways/${id}`, payload);
        return data.data;
    },
    async delete(id: number): Promise<void> {
        await axios.delete(`/api/settings/payment-gateways/${id}`);
    },
};
