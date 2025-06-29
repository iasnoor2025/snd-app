import React, { useEffect, useState } from 'react';
import { PaymentGatewaySetting } from '../../types';
import { PaymentGatewaySettingsService } from '../../services/PaymentGatewaySettingsService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const defaultForm: Partial<PaymentGatewaySetting> = {
  provider: '',
  credentials: {},
  endpoints: {},
  is_active: true,
  metadata: {},
};

export default function PaymentGateways() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<PaymentGatewaySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<PaymentGatewaySetting>>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      setSettings(await PaymentGatewaySettingsService.getAll());
    } catch (e) {
      toast.error(t('settings:payment_gateways.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const openModal = (setting?: PaymentGatewaySetting) => {
    if (setting) {
      setForm(setting);
      setEditingId(setting.id);
    } else {
      setForm(defaultForm);
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    try {
      setForm(f => ({ ...f, [name]: value ? JSON.parse(value) : {} }));
    } catch {
      // ignore parse error for now
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await PaymentGatewaySettingsService.update(editingId, form);
        toast.success(t('settings:payment_gateways.updated'));
      } else {
        await PaymentGatewaySettingsService.create(form);
        toast.success(t('settings:payment_gateways.created'));
      }
      fetchSettings();
      closeModal();
    } catch (err) {
      toast.error(t('settings:payment_gateways.save_error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('settings:payment_gateways.delete_confirm'))) return;
    try {
      await PaymentGatewaySettingsService.delete(id);
      toast.success(t('settings:payment_gateways.deleted'));
      fetchSettings();
    } catch {
      toast.error(t('settings:payment_gateways.delete_error'));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('settings:payment_gateways.title')}</h2>
      <button className="btn btn-primary mb-4" onClick={() => openModal()}>{t('settings:payment_gateways.add')}</button>
      {loading ? (
        <div>{t('settings:payment_gateways.loading')}</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>{t('settings:payment_gateways.provider')}</th>
              <th>{t('settings:payment_gateways.active')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {settings.map(s => (
              <tr key={s.id}>
                <td>{s.provider}</td>
                <td>{s.is_active ? t('common:yes') : t('common:no')}</td>
                <td>
                  <button className="btn btn-sm btn-secondary mr-2" onClick={() => openModal(s)}>{t('common:edit')}</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>{t('common:delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {modalOpen && (
        <div className="modal">
          <div className="modal-box">
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label>{t('settings:payment_gateways.provider')}</label>
                <input name="provider" value={form.provider || ''} onChange={handleChange} className="input input-bordered w-full" required />
              </div>
              <div className="mb-2">
                <label>{t('settings:payment_gateways.credentials')}</label>
                <textarea name="credentials" value={JSON.stringify(form.credentials || {}, null, 2)} onChange={handleJsonChange} className="input input-bordered w-full" rows={3} required />
              </div>
              <div className="mb-2">
                <label>{t('settings:payment_gateways.endpoints')}</label>
                <textarea name="endpoints" value={JSON.stringify(form.endpoints || {}, null, 2)} onChange={handleJsonChange} className="input input-bordered w-full" rows={3} required />
              </div>
              <div className="mb-2">
                <label>
                  <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={handleChange} />
                  {t('settings:payment_gateways.active')}
                </label>
              </div>
              <div className="flex justify-end">
                <button type="button" className="btn btn-secondary mr-2" onClick={closeModal}>{t('common:cancel')}</button>
                <button type="submit" className="btn btn-primary">{editingId ? t('common:update') : t('common:create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
