import axios from 'axios';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  in_app: boolean;
}

export const NotificationPreferenceService = {
  async get(): Promise<NotificationPreferences> {
    const { data } = await axios.get('/api/notifications/preferences');
    return data.data;
  },
  async update(prefs: NotificationPreferences): Promise<NotificationPreferences> {
    const { data } = await axios.post('/api/notifications/preferences', prefs);
    return data.data;
  },
};
