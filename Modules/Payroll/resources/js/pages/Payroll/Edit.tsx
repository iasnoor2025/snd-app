import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';

interface Props {
    payroll: any;
}

const { t } = useTranslation('payrolls');

export const Edit: FC<Props> = ({ payroll }) => {
    return (
        <>
            <Head title={t('ttl_edit_payroll')} />
            <div className="container mx-auto py-6">
                {/* Payroll edit form will go here */}
            </div>
        </>
    );
};

export default Edit;
