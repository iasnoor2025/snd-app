import { useTranslation } from 'react-i18next';

const { t } = useTranslation('employees');

<th>{t('lbl_name')}</th>
<th>{t('lbl_email')}</th>
<th>{t('lbl_phone')}</th>
<th>{t('lbl_status')}</th>
<th>{t('lbl_actions')}</th>

placeholder={t('ph_search_employees')}

<Button>{t('btn_edit')}</Button>
<Button>{t('btn_delete')}</Button>
<Button>{t('btn_show')}</Button>

{t('status_active')}
{t('status_inactive')}

{t('employee_deleted')}
{t('confirm_delete')}
