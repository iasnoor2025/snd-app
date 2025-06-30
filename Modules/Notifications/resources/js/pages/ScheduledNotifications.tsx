import React, { useEffect, useState } from 'react';
import { ScheduledNotification, NotificationTemplate } from '../types';
import { ScheduledNotificationService } from '../services/ScheduledNotificationService';
import { NotificationTemplateService } from '../services/NotificationTemplateService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const defaultForm: Partial<ScheduledNotification> = {
  template_id: 0,
  send_at: '',
  payload: {},
};

export default function ScheduledNotifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<ScheduledNotification>>(defaultForm);

  const fetchAll = async () => {
    setLoading(true);
    try {
      setNotifications(await ScheduledNotificationService.getAll());
      setTemplates(await NotificationTemplateService.getAll());
    } catch (e) {
      toast.error(t('notifications:scheduled.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openModal = () => {
    setForm(defaultForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(defaultForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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
      await ScheduledNotificationService.create(form);
      toast.success(t('notifications:scheduled.created'));
      fetchAll();
      closeModal();
    } catch (err) {
      toast.error(t('notifications:scheduled.save_error'));
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm(t('notifications:scheduled.cancel_confirm'))) return;
    try {
      await ScheduledNotificationService.cancel(id);
      toast.success(t('notifications:scheduled.cancelled'));
      fetchAll();
    } catch {
      toast.error(t('notifications:scheduled.cancel_error'));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('notifications:scheduled.title')}</h2>
      <button className="btn btn-primary mb-4" onClick={openModal}>{t('notifications:scheduled.add')}</button>
      {loading ? (
        <div>{t('notifications:scheduled.loading')}</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>{t('notifications:scheduled.template')}</th>
              <th>{t('notifications:scheduled.send_at')}</th>
              <th>{t('notifications:scheduled.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => (
              <tr key={n.id}>
                <td>{templates.find(tpl => tpl.id === n.template_id)?.name || n.template_id}</td>
                <td>{new Date(n.send_at).toLocaleString()}</td>
                <td>{n.status}</td>
                <td>
                  {n.status === 'pending' && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(n.id)}>{t('notifications:scheduled.cancel')}</button>
                  )}
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
                <label>{t('notifications:scheduled.template')}</label>
                <select name="template_id" value={form.template_id || ''} onChange={handleChange} className="input input-bordered w-full" required>
                  <option value="">{t('notifications:scheduled.select_template')}</option>
                  {templates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label>{t('notifications:scheduled.send_at')}</label>
                <input name="send_at" value={form.send_at || ''} onChange={handleChange} className="input input-bordered w-full" type="datetime-local" required />
              </div>
              <div className="mb-2">
                <label>{t('notifications:scheduled.payload')}</label>
                <textarea name="payload" value={JSON.stringify(form.payload || {}, null, 2)} onChange={handleJsonChange} className="input input-bordered w-full" rows={2} />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={closeModal}
                >
                  {t('ui.buttons.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">{t('common:create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
