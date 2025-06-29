import React, { useEffect, useState } from 'react';
import { SsoSetting } from '../../types';
import { SsoSettingsService } from '../../services/SsoSettingsService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const defaultForm: Partial<SsoSetting> = {
  provider: '',
  client_id: '',
  client_secret: '',
  discovery_url: '',
  redirect_uri: '',
  scopes: 'openid email profile',
  is_active: true,
  metadata: {},
};

export default function Sso() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SsoSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<SsoSetting>>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      setSettings(await SsoSettingsService.getAll());
    } catch (e) {
      toast.error(t('settings:sso.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const openModal = (setting?: SsoSetting) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await SsoSettingsService.update(editingId, form);
        toast.success(t('settings:sso.updated'));
      } else {
        await SsoSettingsService.create(form);
        toast.success(t('settings:sso.created'));
      }
      fetchSettings();
      closeModal();
    } catch (err) {
      toast.error(t('settings:sso.save_error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('settings:sso.delete_confirm'))) return;
    try {
      await SsoSettingsService.delete(id);
      toast.success(t('settings:sso.deleted'));
      fetchSettings();
    } catch {
      toast.error(t('settings:sso.delete_error'));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('settings:sso.title')}</h2>
      <button className="btn btn-primary mb-4" onClick={() => openModal()}>{t('settings:sso.add')}</button>
      {loading ? (
        <div>{t('settings:sso.loading')}</div>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>{t('settings:sso.provider')}</th>
              <th>{t('settings:sso.discovery_url')}</th>
              <th>{t('settings:sso.active')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {settings.map(s => (
              <tr key={s.id}>
                <td>{s.provider}</td>
                <td>{s.discovery_url}</td>
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
                <label>{t('settings:sso.provider')}</label>
                <input name="provider" value={form.provider || ''} onChange={handleChange} className="input input-bordered w-full" required />
              </div>
              <div className="mb-2">
                <label>{t('settings:sso.client_id')}</label>
                <input name="client_id" value={form.client_id || ''} onChange={handleChange} className="input input-bordered w-full" required />
              </div>
              <div className="mb-2">
                <label>{t('settings:sso.client_secret')}</label>
                <input name="client_secret" value={form.client_secret || ''} onChange={handleChange} className="input input-bordered w-full" required type="password" />
              </div>
              <div className="mb-2">
                <label>{t('settings:sso.discovery_url')}</label>
                <input name="discovery_url" value={form.discovery_url || ''} onChange={handleChange} className="input input-bordered w-full" required type="url" />
              </div>
              <div className="mb-2">
                <label>{t('settings:sso.redirect_uri')}</label>
                <input name="redirect_uri" value={form.redirect_uri || ''} onChange={handleChange} className="input input-bordered w-full" required type="url" />
              </div>
              <div className="mb-2">
                <label>{t('settings:sso.scopes')}</label>
                <input name="scopes" value={form.scopes || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div className="mb-2">
                <label>
                  <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={handleChange} />
                  {t('settings:sso.active')}
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
