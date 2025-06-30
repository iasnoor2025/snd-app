import React, { useEffect, useState } from 'react';
import { NotificationTemplate } from '../types';
import { NotificationTemplateService } from '../services/NotificationTemplateService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const defaultForm: Partial<NotificationTemplate> = {
  name: '',
  type: '',
  subject: '',
  body: '',
  variables: {},
  is_active: true,
};

export default function NotificationTemplates() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<NotificationTemplate>>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      setTemplates(await NotificationTemplateService.getAll());
    } catch (e) {
      toast.error(t('notifications:templates.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openModal = (template?: NotificationTemplate) => {
    if (template) {
      setForm(template);
      setEditingId(template.id);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        await NotificationTemplateService.update(editingId, form);
        toast.success(t('notifications:templates.updated'));
      } else {
        await NotificationTemplateService.create(form);
        toast.success(t('notifications:templates.created'));
      }
      fetchTemplates();
      closeModal();
    } catch (err) {
      toast.error(t('notifications:templates.save_error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('notifications:templates.delete_confirm'))) return;
    try {
      await NotificationTemplateService.delete(id);
      toast.success(t('notifications:templates.deleted'));
      fetchTemplates();
    } catch {
      toast.error(t('notifications:templates.delete_error'));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('notifications:templates.title')}</h2>
      <button className="btn btn-primary mb-4" onClick={() => openModal()}>{t('notifications:templates.add')}</button>
      {loading ? (
        <div>{t('notifications:templates.loading')}</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>{t('notifications:templates.name')}</th>
              <th>{t('notifications:templates.type')}</th>
              <th>{t('notifications:templates.active')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {templates.map(tpl => (
              <tr key={tpl.id}>
                <td>{tpl.name}</td>
                <td>{tpl.type}</td>
                <td>{tpl.is_active ? t('common:yes') : t('common:no')}</td>
                <td>
                  <button className="btn btn-sm btn-secondary mr-2" onClick={() => openModal(tpl)}>{t('common:edit')}</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tpl.id)}>{t('common:delete')}</button>
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
                <label>{t('notifications:templates.name')}</label>
                <input name="name" value={form.name || ''} onChange={handleChange} className="input input-bordered w-full" required />
              </div>
              <div className="mb-2">
                <label>{t('notifications:templates.type')}</label>
                <input name="type" value={form.type || ''} onChange={handleChange} className="input input-bordered w-full" required />
              </div>
              <div className="mb-2">
                <label>{t('notifications:templates.subject')}</label>
                <input name="subject" value={form.subject || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div className="mb-2">
                <label>{t('notifications:templates.body')}</label>
                <textarea name="body" value={form.body || ''} onChange={handleChange} className="input input-bordered w-full" rows={4} required />
              </div>
              <div className="mb-2">
                <label>{t('notifications:templates.variables')}</label>
                <textarea name="variables" value={JSON.stringify(form.variables || {}, null, 2)} onChange={handleJsonChange} className="input input-bordered w-full" rows={2} />
              </div>
              <div className="mb-2">
                <label>
                  <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={handleChange} />
                  {t('notifications:templates.active')}
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={closeModal}
                >
                  {t('ui.buttons.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">{editingId ? t('common:update') : t('common:create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
