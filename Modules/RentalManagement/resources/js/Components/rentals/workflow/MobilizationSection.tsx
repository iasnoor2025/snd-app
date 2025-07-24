import {
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
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
import { format } from 'date-fns';
import { CalendarClock, CheckSquare, Loader2, MapPin, Phone, Truck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import RentalItemsCard from '../RentalItemsCard';
// import { MapView } from "@/Core";
import StatusTimeline from '../StatusTimeline';

// Interface for MobilizationSection props
interface MobilizationSectionProps {
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

export default function MobilizationSection({ rental, rentalItems, permissions }: MobilizationSectionProps) {
    const { t } = useTranslation('rental');

    const [selectedTab, setSelectedTab] = React.useState('tracking');
    const [isMarkingComplete, setIsMarkingComplete] = React.useState(false);
    const [isMapViewOpen, setIsMapViewOpen] = React.useState(false);

    // Get estimated delivery time
    const getEstimatedDelivery = () => {
        if (rental.mobilization_data?.estimated_delivery) {
            return format(new Date(rental.mobilization_data.estimated_delivery), 'PPp');
        }

        // If not available, return start date with default time
        if (rental.start_date) {
            const date = new Date(rental.start_date);
            date.setHours(12, 0, 0);
            return format(date, 'PPp');
        }

        return 'Not specified';
    };

    // Mark mobilization as complete
    const handleMarkComplete = () => {
        if (!permissions.update) {
            return;
        }

        setIsMarkingComplete(true);

        // In a real implementation, call an API endpoint to mark mobilization complete
        setTimeout(() => {
            window.location.href = `/rentals/${rental.id}/mobilization/complete`;
        }, 1500);
    };

    // Get mobilization progress (random for demo)
    const getMobilizationProgress = () => {
        // In a real implementation, this would come from the server
        // For demo, generate a random stage
        const stages = [
            { name: 'Equipment Prepared', complete: true, timestamp: '2 hours ago' },
            { name: 'Loading Complete', complete: true, timestamp: '1 hour ago' },
            { name: 'In Transit', complete: true, timestamp: '45 minutes ago' },
            { name: 'Arrival at Location', complete: false, timestamp: null },
            { name: 'Setup Complete', complete: false, timestamp: null },
        ];

        return stages;
    };

    return (
        <div className="space-y-4">
            {/* Workflow history / audit trail */}
            <StatusTimeline rental={rental} />

            {/* Mobilization alert */}
            <Alert className="border-orange-200 bg-orange-50 text-orange-800">
                <Truck className="h-4 w-4 text-orange-600" />
                <AlertTitle>{t('ttl_mobilization_in_progress')}</AlertTitle>
                <AlertDescription>Equipment is currently being transported to the rental location.</AlertDescription>
            </Alert>

            {/* Tabs for mobilization state */}
            <Tabs defaultValue="tracking" onValueChange={setSelectedTab} value={selectedTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="tracking">Tracking</TabsTrigger>
                    <TabsTrigger value="items">{t('equipment_list')}</TabsTrigger>
                    <TabsTrigger value="location">{t('delivery_location')}</TabsTrigger>
                </TabsList>

                <TabsContent value="tracking">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{t('ttl_mobilization_tracking')}</CardTitle>
                                    <CardDescription>Current status of equipment transport</CardDescription>
                                </div>
                                <Badge variant="outline" className="border-orange-200 bg-orange-100 text-orange-800">
                                    In Transit
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Estimated delivery */}
                                <div className="rounded-md bg-secondary/20 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CalendarClock className="mr-2 h-5 w-5 text-orange-600" />
                                            <span className="font-medium">Estimated Delivery:</span>
                                        </div>
                                        <span>{getEstimatedDelivery()}</span>
                                    </div>
                                </div>

                                {/* Mobilization progress */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">{t('mobilization_progress')}</h3>

                                    <div className="relative space-y-6 pl-8">
                                        {/* Progress line */}
                                        <div className="absolute top-1 bottom-1 left-3.5 w-0.5 bg-gray-200"></div>

                                        {getMobilizationProgress().map((stage, index) => (
                                            <div key={index} className="relative">
                                                {/* Progress circle */}
                                                <div
                                                    className={`absolute top-0.5 left-[-24px] h-5 w-5 rounded-full border-2 ${
                                                        stage.complete ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                                                    } flex items-center justify-center`}
                                                >
                                                    {stage.complete && <CheckSquare className="h-3 w-3 text-white" />}
                                                </div>

                                                {/* Stage content */}
                                                <div className={`${stage.complete ? 'text-black' : 'text-gray-500'}`}>
                                                    <h4 className="font-medium">{stage.name}</h4>
                                                    <p className="text-xs">{stage.complete ? stage.timestamp : 'Pending'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Transport details */}
                                <div>
                                    <h3 className="mb-2 text-sm font-medium">{t('transport_details')}</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p className="text-muted-foreground">Transport Type:</p>
                                        <p>{rental.mobilization_data?.transport_type || 'Standard Truck'}</p>

                                        <p className="text-muted-foreground">Driver:</p>
                                        <p>{rental.mobilization_data?.driver_name || 'Assigned Driver'}</p>

                                        <p className="text-muted-foreground">Contact:</p>
                                        <div className="flex items-center">
                                            <Phone className="mr-1 h-3 w-3" />
                                            <p>{rental.mobilization_data?.driver_phone || 'Contact Office'}</p>
                                        </div>

                                        <p className="text-muted-foreground">Special Instructions:</p>
                                        <p>{rental.mobilization_data?.special_instructions || 'None'}</p>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="default"
                                        className="flex-1"
                                        onClick={handleMarkComplete}
                                        disabled={isMarkingComplete || !permissions.update}
                                    >
                                        {isMarkingComplete ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckSquare className="mr-2 h-4 w-4" />
                                                Mark Delivery Complete
                                            </>
                                        )}
                                    </Button>

                                    <Button variant="outline" className="flex-1" onClick={() => setIsMapViewOpen(true)}>
                                        <MapPin className="mr-2 h-4 w-4" />
                                        View Location
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="items">
                    <RentalItemsCard
                        rentalId={rental.id}
                        items={rentalItems.data}
                        canAddItems={permissions.update}
                        equipment={rental.dropdowns?.equipment || []}
                        operators={rental.dropdowns?.employees || []}
                    />
                </TabsContent>

                <TabsContent value="location">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('delivery_location')}</CardTitle>
                            <CardDescription>Where the equipment is being delivered</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rental.location ? (
                                <div className="space-y-4">
                                    <div className="rounded-md bg-secondary/20 p-4">
                                        <h3 className="mb-2 text-sm font-medium">{t('delivery_address')}</h3>
                                        <p>{rental.location.name || rental.customer.company_name}</p>
                                        <p>{rental.location.address}</p>
                                        <p>
                                            {rental.location.city}, {rental.location.state} {rental.location.postal_code}
                                        </p>
                                        <p>{rental.location.country}</p>
                                    </div>

                                    {rental.location.latitude && rental.location.longitude ? (
                                        <div className="flex h-[300px] items-center justify-center overflow-hidden rounded-md border text-center">
                                            {/* MapView component is missing. Please implement or restore this component. */}
                                            <span className="text-muted-foreground">Map preview unavailable</span>
                                        </div>
                                    ) : (
                                        <div className="rounded-md bg-secondary/10 py-8 text-center">
                                            <MapPin className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                                            <p className="text-muted-foreground">{t('no_map_coordinates_available')}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="mb-2 text-sm font-medium">{t('contact_at_location')}</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <p className="text-muted-foreground">Contact Person:</p>
                                            <p>{rental.location.contact_person || rental.customer.contact_person}</p>

                                            <p className="text-muted-foreground">Phone:</p>
                                            <p>{rental.location.contact_phone || rental.customer.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <MapPin className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                                    <p className="text-muted-foreground">{t('no_location_information_available')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
