import { Card, CardContent, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/Components/ui/card';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Training {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    certificate_url: string;
}

export function TrainingList() {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation('employees');

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/trainings');
            const data = await res.json();
            setTrainings(data.data);
        } catch {
            toast.error('Failed to fetch trainings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('lbl_trainings')}</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="min-w-full border text-sm">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">{t('lbl_title')}</th>
                            <th className="border px-2 py-1">{t('lbl_start')}</th>
                            <th className="border px-2 py-1">{t('lbl_end')}</th>
                            <th className="border px-2 py-1">{t('lbl_location')}</th>
                            <th className="border px-2 py-1">{t('lbl_actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainings.map((training) => (
                            <tr key={training.id}>
                                <td className="border px-2 py-1">{training.title}</td>
                                <td className="border px-2 py-1">{formatDateMedium(training.start_date)}</td>
                                <td className="border px-2 py-1">{formatDateMedium(training.end_date)}</td>
                                <td className="border px-2 py-1">{training.location}</td>
                                <td className="border px-2 py-1">{/* Assignment and completion actions can be added here */}</td>
                            </tr>
                        ))}
                        {trainings.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-2 text-center">
                                    {t('msg_no_trainings_found')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
