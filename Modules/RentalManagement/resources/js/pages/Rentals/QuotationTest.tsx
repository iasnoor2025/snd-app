import { AppLayout, Button, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function QuotationTest({ auth }: { auth?: any }) {
    const { t } = useTranslation('rental');

    const [isGenerating, setIsGenerating] = useState(false);

    const handleDirectGeneration = () => {
        const rentalId = 1; // Example rental ID, adjust as needed

        setIsGenerating(true);
        toast.loading('Testing direct quotation generation...');

        try {
            // Store in session storage
            window.sessionStorage.setItem('generating_quotation_test', 'true');

            // Delay to simulate processing
            setTimeout(() => {
                toast.success('Test completed successfully');
                setIsGenerating(false);
            }, 2000);

            // Uncomment this to test actual navigation
            // window.location.href = route("rentals.direct-generate-quotation", rentalId);
        } catch (error) {
            console.error('Test failed:', error);
            toast.error('Test failed');
            setIsGenerating(false);
        }
    };

    const handleInertiaGeneration = () => {
        const rentalId = 1; // Example rental ID, adjust as needed

        setIsGenerating(true);
        toast.loading('Testing Inertia quotation generation...');

        try {
            // This would normally use Inertia router
            setTimeout(() => {
                toast.success('Inertia test completed successfully');
                setIsGenerating(false);
            }, 2000);

            // Uncomment to test with Inertia router
            // router.post(route("rentals.generate-quotation", rentalId));
        } catch (error) {
            console.error('Inertia test failed:', error);
            toast.error('Inertia test failed');
            setIsGenerating(false);
        }
    };

    const checkSessionStorage = () => {
        const hasValue = window.sessionStorage.getItem('generating_quotation_test') === 'true';
        toast.info(`Session storage test value: ${hasValue ? 'Found' : 'Not found'}`);
    };

    return (
        <AppLayout>
            <Head title={t('ttl_quotation_test')} />

            <div className="container mx-auto py-6">
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>{t('ttl_generate_quotation_test')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="mb-2 text-lg font-medium">{t('direct_generation_test')}</h3>
                            <p className="mb-4 text-sm text-muted-foreground">Tests window.location.href approach</p>
                            <Button
                                variant="default"
                                className="mr-4 bg-black text-white hover:bg-black/90"
                                onClick={handleDirectGeneration}
                                disabled={isGenerating}
                            >
                                Test Direct Generation
                            </Button>
                        </div>

                        <div>
                            <h3 className="mb-2 text-lg font-medium">{t('inertia_generation_test')}</h3>
                            <p className="mb-4 text-sm text-muted-foreground">Tests Inertia router approach</p>
                            <Button
                                variant="default"
                                className="mr-4 bg-primary text-white hover:bg-primary/90"
                                onClick={handleInertiaGeneration}
                                disabled={isGenerating}
                            >
                                Test Inertia Generation
                            </Button>
                        </div>

                        <div>
                            <h3 className="mb-2 text-lg font-medium">{t('session_storage_test')}</h3>
                            <p className="mb-4 text-sm text-muted-foreground">Check if session storage is working correctly</p>
                            <Button variant="outline" onClick={checkSessionStorage}>
                                Check Session Storage
                            </Button>
                        </div>

                        <div>
                            <h3 className="mb-2 text-lg font-medium">{t('clear_session_storage')}</h3>
                            <p className="mb-4 text-sm text-muted-foreground">Reset test state</p>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    window.sessionStorage.removeItem('generating_quotation_test');
                                    toast.success('Session storage cleared');
                                }}
                            >
                                {t('clear_session_storage')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
