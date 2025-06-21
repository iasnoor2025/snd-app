import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/Core";
import { Badge } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Separator } from "@/Core";
import { Button } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import {
  Calendar,
  ClipboardList,
  WrenchIcon,
  User,
  TruckIcon,
  ClockIcon,
  BookOpenIcon,
  InfoIcon,
  Package
} from 'lucide-react';
import { MaintenanceParts } from './MaintenanceParts';

interface Equipment {
  id: number;
  name: string;
  model: string;
  serial_number: string;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_url?: string;
}

interface Part {
  id: number;
  name: string;
  part_number: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  in_stock: boolean;
}

interface MaintenanceRecord {
  id: number;
  equipment_id: number;
  type: string;
  description: string;
  status: string;
  scheduled_date: string;
  performed_date: string | null;
  performed_by: number | null;
  notes: string | null;
  equipment: Equipment;
  performedBy?: User;
  parts?: Part[];
}

interface MaintenanceDetailViewProps {
  record: MaintenanceRecord;
  availableParts?: Part[];
  onSuccess?: () => void;
}

export function MaintenanceDetailView({ record, availableParts = [], onSuccess }: MaintenanceDetailViewProps) {
  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'bg-blue-100 text-blue-800';
      case 'repair':
        return 'bg-amber-100 text-amber-800';
      case 'inspection':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Details</h2>
          <p className="text-muted-foreground">ID: {record.id}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getMaintenanceTypeColor(record.type)} variant="outline">
            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
          </Badge>
          <Badge className={getStatusColor(record.status)} variant="outline">
            {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">
            <InfoIcon className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="parts">
            <Package className="h-4 w-4 mr-2" />
            Parts & Materials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TruckIcon className="h-4 w-4 mr-2" />
                  Equipment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h3 className="font-medium">{record.equipment.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Model: {record.equipment.model}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p>Serial Number: {record.equipment.serial_number}</p>
                    <p>Status: {record.equipment.status}</p>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={route('equipment.show', record.equipment.id)}>
                        View Equipment Details
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Schedule Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Scheduled Date</p>
                      <p className="text-sm">{format(parseISO(record.scheduled_date), 'PPP')}</p>
                    </div>
                  </div>

                  {record.performed_date && (
                    <div className="flex items-center space-x-2">
                      <WrenchIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Performed Date</p>
                        <p className="text-sm">{format(parseISO(record.performed_date), 'PPP')}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Assigned Technician</p>
                      {record.performedBy ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={record.performedBy.profile_photo_url}
                              alt={record.performedBy.name}
                            />
                            <AvatarFallback>{record.performedBy.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm">{record.performedBy.name}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                Maintenance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center">
                    <InfoIcon className="h-4 w-4 mr-1" />
                    Description
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {record.description}
                  </p>
                </div>

                {record.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <BookOpenIcon className="h-4 w-4 mr-1" />
                      Notes
                    </h4>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {record.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts" className="mt-0">
          <MaintenanceParts
            maintenanceId={record.id}
            parts={record.parts || []}
            availableParts={availableParts}
            onSuccess={onSuccess}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" asChild>
          <a href={route('equipment.maintenance.schedule.edit', record.id)}>
            Reschedule
          </a>
        </Button>
        {record.status === 'scheduled' && (
          <Button asChild>
            <a href={route('equipment.maintenance.complete', record.id)}>
              Mark as Completed
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

















