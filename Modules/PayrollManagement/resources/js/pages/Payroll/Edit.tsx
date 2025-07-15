import FileUpload from '@/Core/components/ui/FileUpload';
import { Button } from '@/Core/components/ui/button';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Props {
    payroll: any;
    employee?: any;
    items?: any[];
    employees?: any[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

const { t } = useTranslation('payrolls');

export const Edit: FC<Props> = ({ payroll, employee = {}, items = [], employees = [], created_at, updated_at, deleted_at }) => {
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
    React.useEffect(() => {
        if (payroll) {
        }
    }, [payroll]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        // Add payroll fields to formData as needed
        if (uploadedFile) {
            formData.append('document', uploadedFile);
        }
        try {
            await axios.post('/api/payroll/update', formData);
            toast.success('Payroll updated successfully');
        } catch (error) {
            toast.error('Failed to update payroll');
        }
    };
    return (
        <>
            <Head title={t('ttl_edit_payroll')} />
            <div className="container mx-auto py-6">
                <form onSubmit={handleSubmit}>
                    {/* Payroll edit form will go here */}
                    <div className="mt-4">
                        <label className="mb-1 block font-medium">Upload Payroll Document</label>
                        <FileUpload onFileSelect={setUploadedFile} accept=".pdf,.jpg,.jpeg,.png" maxSize={10 * 1024 * 1024} />
                    </div>
                    <Button type="submit">Save Changes</Button>
                </form>
            </div>
        </>
    );
};

export default Edit;
