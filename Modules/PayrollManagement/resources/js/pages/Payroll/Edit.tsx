import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
    payroll: any;
}

const { t } = useTranslation('payrolls');

export const Edit: FC<Props> = ({ payroll }) => {
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
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
                        <label className="block font-medium mb-1">Upload Payroll Document</label>
                        <FileUpload onFileSelect={setUploadedFile} accept=".pdf,.jpg,.jpeg,.png" maxSize={10 * 1024 * 1024} />
                    </div>
                    <Button type="submit">Save Changes</Button>
                </form>
            </div>
        </>
    );
};

export default Edit;














