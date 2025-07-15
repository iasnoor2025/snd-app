import { Button } from '@/Core/components/Common/Button';
import { useTranslation } from 'react-i18next';

export default function EmployeeList() {
    const { t } = useTranslation('employees');

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th>{t('lbl_name')}</th>
                        <th>{t('lbl_email')}</th>
                        <th>{t('lbl_phone')}</th>
                        <th>{t('lbl_status')}</th>
                        <th>{t('lbl_actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Example row, replace with actual data mapping */}
                    <tr>
                        <td>John Doe</td>
                        <td>john@example.com</td>
                        <td>123-456-7890</td>
                        <td>{t('status_active')}</td>
                        <td>
                            <Button>{t('btn_edit')}</Button>
                            <Button>{t('btn_delete')}</Button>
                            <Button>{t('btn_show')}</Button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}
