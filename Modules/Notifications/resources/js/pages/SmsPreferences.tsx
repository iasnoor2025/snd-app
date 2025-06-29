import React, { useState } from 'react';
import { SmsNotificationService } from '../services/SmsNotificationService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function SmsPreferences() {
  const { t } = useTranslation();
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('This is a test SMS.');

  const handleSend = async () => {
    try {
      if (!to || !message) {
        toast.error(t('notifications:sms.enter_details'));
        return;
      }
      await SmsNotificationService.sendTest(to, message);
      toast.success(t('notifications:sms.sent'));
    } catch {
      toast.error(t('notifications:sms.error'));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('notifications:sms.title')}</h2>
      <div className="mb-4">
        <label>{t('notifications:sms.to')}</label>
        <input value={to} onChange={e => setTo(e.target.value)} className="input input-bordered w-full" />
      </div>
      <div className="mb-4">
        <label>{t('notifications:sms.message')}</label>
        <input value={message} onChange={e => setMessage(e.target.value)} className="input input-bordered w-full" />
      </div>
      <button className="btn btn-primary" onClick={handleSend}>{t('notifications:sms.send')}</button>
    </div>
  );
}
