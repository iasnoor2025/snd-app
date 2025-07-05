import React, { useEffect, useState } from 'react';
import { Webhook } from '../../types';
import { WebhookService } from '../../services/WebhookService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

const defaultForm: Partial<Webhook> = {
  event: '',
  url: '',
  secret: '',
  is_active: true,
};

export default function Webhooks() {
  const { t } = useTranslation();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Webhook>>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      setWebhooks(await WebhookService.getAll());
    } catch (e) {
      toast.error(t('settings:webhooks.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const openModal = (webhook?: Webhook) => {
    if (webhook) {
      setForm(webhook);
      setEditingId(webhook.id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await WebhookService.update(editingId, form);
        toast.success(t('settings:webhooks.updated'));
      } else {
        await WebhookService.create(form);
        toast.success(t('settings:webhooks.created'));
      }
      fetchWebhooks();
      closeModal();
    } catch (err) {
      toast.error(t('settings:webhooks.save_error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('settings:webhooks.delete_confirm'))) return;
    try {
      await WebhookService.delete(id);
      toast.success(t('settings:webhooks.deleted'));
      fetchWebhooks();
    } catch {
      toast.error(t('settings:webhooks.delete_error'));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('settings:webhooks.title')}</h2>
      <button className="btn btn-primary mb-4" onClick={() => openModal()}>{t('settings:webhooks.add')}</button>
      {loading ? (
        <div>{t('settings:webhooks.loading')}</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>{t('settings:webhooks.event')}</th>
              <th>{t('settings:webhooks.url')}</th>
              <th>{t('settings:webhooks.active')}</th>
              <th>{t('settings:webhooks.last_triggered')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map(w => (
              <tr key={w.id}>
                <td>{w.event}</td>
                <td>{w.url}</td>
                <td>{w.is_active ? t('common:yes') : t('common:no')}</td>
                <td>{w.last_triggered_at ? new Date(w.last_triggered_at) : '-'}</td>
                <td>
                  <button className="btn btn-sm btn-secondary mr-2" onClick={() => openModal(w)}>{t('common:edit')}</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(w.id)}>{t('common:delete')}</button>
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
                <label>{t('settings:webhooks.event')}</label>
                <input name="event" value={form.event || ''} onChange={handleChange} className="input input-bordered w-full" required />
              </div>
              <div className="mb-2">
                <label>{t('settings:webhooks.url')}</label>
                <input name="url" value={form.url || ''} onChange={handleChange} className="input input-bordered w-full" required type="url" />
              </div>
              <div className="mb-2">
                <label>{t('settings:webhooks.secret')}</label>
                <input name="secret" value={form.secret || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div className="mb-2">
                <label>
                  <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={handleChange} />
                  {t('settings:webhooks.active')}
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
