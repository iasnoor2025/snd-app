import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Core";
import { Alert, AlertDescription, AlertTitle } from "@/Core";
import { Button } from "@/Core";
import { Badge } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import { Truck, MapPin, Calendar, Loader2, Clock, Phone, CheckSquare, CalendarClock } from "lucide-react";
import RentalItemsCard from "../../rentals/RentalItemsCard";
import { format } from "date-fns";
// import { MapView } from "@/Core";
import { Progress } from "@/Core";
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

export default function MobilizationSection({
  rental,
  rentalItems,
  permissions
}: MobilizationSectionProps) {
  const { t } = useTranslation('rental');

  const [selectedTab, setSelectedTab] = React.useState("tracking");
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
      { name: 'Setup Complete', complete: false, timestamp: null }
    ];

    return stages;
  };

  return (
    <div className="space-y-4">
      {/* Workflow history / audit trail */}
      <StatusTimeline rental={rental} />

      {/* Mobilization alert */}
      <Alert className="bg-orange-50 border-orange-200 text-orange-800">
        <Truck className="h-4 w-4 text-orange-600" />
        <AlertTitle>{t('ttl_mobilization_in_progress')}</AlertTitle>
        <AlertDescription>
          Equipment is currently being transported to the rental location.
        </AlertDescription>
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{t('ttl_mobilization_tracking')}</CardTitle>
                  <CardDescription>
                    Current status of equipment transport
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                  In Transit
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Estimated delivery */}
                <div className="bg-secondary/20 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CalendarClock className="h-5 w-5 mr-2 text-orange-600" />
                      <span className="font-medium">Estimated Delivery:</span>
                    </div>
                    <span>{getEstimatedDelivery()}</span>
                  </div>
                </div>

                {/* Mobilization progress */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">{t('mobilization_progress')}</h3>

                  <div className="relative pl-8 space-y-6">
                    {/* Progress line */}
                    <div className="absolute left-3.5 top-1 bottom-1 w-0.5 bg-gray-200"></div>

                    {getMobilizationProgress().map((stage, index) => (
                      <div key={index} className="relative">
                        {/* Progress circle */}
                        <div className={`absolute left-[-24px] top-0.5 h-5 w-5 rounded-full border-2 ${
                          stage.complete
                            ? 'bg-green-500 border-green-500'
                            : 'bg-white border-gray-300'
                        } flex items-center justify-center`}>
                          {stage.complete && (
                            <CheckSquare className="h-3 w-3 text-white" />
                          )}
                        </div>

                        {/* Stage content */}
                        <div className={`${stage.complete ? 'text-black' : 'text-gray-500'}`}>
                          <h4 className="font-medium">{stage.name}</h4>
                          <p className="text-xs">
                            {stage.complete
                              ? stage.timestamp
                              : 'Pending'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transport details */}
                <div>
                  <h3 className="text-sm font-medium mb-2">{t('transport_details')}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-muted-foreground">Transport Type:</p>
                    <p>{rental.mobilization_data?.transport_type || 'Standard Truck'}</p>

                    <p className="text-muted-foreground">Driver:</p>
                    <p>{rental.mobilization_data?.driver_name || 'Assigned Driver'}</p>

                    <p className="text-muted-foreground">Contact:</p>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
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

                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsMapViewOpen(true)}
                  >
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
              <CardDescription>
                Where the equipment is being delivered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rental.location ? (
                <div className="space-y-4">
                  <div className="bg-secondary/20 p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">{t('delivery_address')}</h3>
                    <p>{rental.location.name || rental.customer.company_name}</p>
                    <p>{rental.location.address}</p>
                    <p>
                      {rental.location.city}, {rental.location.state} {rental.location.postal_code}
                    </p>
                    <p>{rental.location.country}</p>
                  </div>

                  {(rental.location.latitude && rental.location.longitude) ? (
                    <div className="h-[300px] rounded-md overflow-hidden border text-center flex items-center justify-center">
                      {/* MapView component is missing. Please implement or restore this component. */}
                      <span className="text-muted-foreground">Map preview unavailable</span>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-secondary/10 rounded-md">
                      <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">{t('no_map_coordinates_available')}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium mb-2">{t('contact_at_location')}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-muted-foreground">Contact Person:</p>
                      <p>{rental.location.contact_person || rental.customer.contact_person}</p>

                      <p className="text-muted-foreground">Phone:</p>
                      <p>{rental.location.contact_phone || rental.customer.phone}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
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















