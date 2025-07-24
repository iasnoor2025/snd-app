import {
    Alert,
    AlertDescription,
    AlertTitle,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Core';
import { Inertia } from '@inertiajs/inertia';
import { format } from 'date-fns';
import { Clock, FileText, Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import RentalItemsCard from '../RentalItemsCard';
import StatusTimeline from '../StatusTimeline';

// Interface for PendingSection props
interface PendingSectionProps {
    rental: any;
    rentalItems: {
        data: any[];
        total: number;
    };
    permissions: {
        view: boolean;
        update: boolean;
        delete: boolean;
        approve: boolean;
        complete: boolean;
        generate_invoice: boolean;
        view_timesheets: boolean;
        request_extension: boolean;
    };
    onExtensionSuccess?: () => void;
    // Other props are available but not used in this component
}

export default function PendingSection({ rental, rentalItems, permissions }: PendingSectionProps) {
    const { t } = useTranslation('rental');

    const [selectedTab, setSelectedTab] = React.useState('items');
    const [isGeneratingQuotation, setIsGeneratingQuotation] = React.useState(false);

    // Function to generate a quotation
    const handleGenerateQuotation = () => {
        if (!permissions.generate_invoice) {
            toast.error(t('error_no_permission'));
            return;
        }
        if (!rentalItems.data || rentalItems.data.length === 0) {
            toast.error(t('Cannot generate quotation: This rental has no items. Please add items first.'));
            return;
        }
        setIsGeneratingQuotation(true);
        Inertia.post(
            `/rentals/${rental.id}/generate-quotation`,
            {},
            {
                onSuccess: () => setIsGeneratingQuotation(false),
                onError: () => setIsGeneratingQuotation(false),
            },
        );
    };

    return (
        <div className="space-y-4">
            {/* Workflow history / audit trail */}
            <StatusTimeline rental={rental} />

            {/* Pending rental alert */}
            <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>{t('ttl_pending_rental')}</AlertTitle>
                <AlertDescription>This rental is pending approval. Generate a quotation to proceed with the workflow.</AlertDescription>
            </Alert>

            {/* Action buttons for pending state */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('ttl_pending_actions')}</CardTitle>
                    <CardDescription>{t('available_actions_for_this_pending_rental')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="rounded-md bg-secondary/20 p-4">
                            <h3 className="mb-2 text-sm font-medium">{t('rental_summary')}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Customer:</div>
                                <div className="font-medium">{rental.customer?.company_name || rental.customer?.name || '-'}</div>

                                <div>Rental Number:</div>
                                <div className="font-medium">{rental.rental_number}</div>

                                <div>Created On:</div>
                                <div className="font-medium">{rental.created_at ? format(new Date(rental.created_at), 'PPP') : 'N/A'}</div>

                                <div>Items Count:</div>
                                <div className="font-medium">{rentalItems.data.length}</div>

                                <div>Total Amount:</div>
                                <div className="font-medium">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'SAR',
                                    }).format(
                                        rentalItems.data.reduce((sum, item) => {
                                            // Use total_amount if present, fallback to total, parse as float
                                            const amount = parseFloat(item.total_amount ?? item.total ?? 0);
                                            return sum + (isNaN(amount) ? 0 : amount);
                                        }, 0),
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={handleGenerateQuotation}
                                disabled={
                                    isGeneratingQuotation || !permissions.generate_invoice || !rentalItems.data || rentalItems.data.length === 0
                                }
                            >
                                {isGeneratingQuotation ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Quotation...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Generate Quotation
                                    </>
                                )}
                            </Button>

                            {rental.quotation_id && (
                                <Button variant="outline" asChild>
                                    <a href={`/quotations/${rental.quotation_id}`}>View Quotation</a>
                                </Button>
                            )}

                            <Button variant="outline" asChild>
                                <a href={`/rentals/${rental.id}/edit`}>Edit Rental Details</a>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for pending state - focused on items */}
            <Tabs defaultValue="items" onValueChange={setSelectedTab} value={selectedTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="items">{t('rental_items')}</TabsTrigger>
                </TabsList>

                <TabsContent value="items">
                    <RentalItemsCard
                        rentalId={rental.id}
                        items={rentalItems.data}
                        canAddItems={permissions.update}
                        equipment={rental.dropdowns?.equipment || []}
                        operators={rental.dropdowns?.employees || []}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
