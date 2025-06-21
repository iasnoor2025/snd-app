import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Badge } from "@/Core";
import { Button } from "@/Core";
import { format, parseISO } from 'date-fns';
import { PageBreadcrumb } from '../../../../components/PageBreadcrumb';
import { MaintenanceParts } from '../Schedule/MaintenanceParts';
import { TruckIcon, Calendar, WrenchIcon, User } from 'lucide-react';

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
  parts: Part[];
}

interface IndexProps {
  maintenanceRecord: MaintenanceRecord;
  availableParts: Part[];
}

export default function Index({ maintenanceRecord, availableParts }: IndexProps) {
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

  const breadcrumbItems = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Equipment', href: route('equipment.index') },
    { title: 'Maintenance', href: route('equipment.maintenance.index') },
    { title: 'Schedule', href: route('equipment.maintenance.schedule.index') },
    {
      title: `Maintenance #${maintenanceRecord.id}`,
      href: route('equipment.maintenance.show', maintenanceRecord.id)
    },
    { title: 'Parts', href: route('equipment.maintenance.parts.index', maintenanceRecord.id) },
  ];

  return (
    <AppLayout>
      <Head title={`Parts - Maintenance #${maintenanceRecord.id}`} />

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <PageBreadcrumb items={breadcrumbItems} />
          <div className="flex items-center space-x-2">
            <Badge className={getMaintenanceTypeColor(maintenanceRecord.type)} variant="outline">
              {maintenanceRecord.type.charAt(0).toUpperCase() + maintenanceRecord.type.slice(1)}
            </Badge>
            <Badge className={getStatusColor(maintenanceRecord.status)} variant="outline">
              {maintenanceRecord.status.charAt(0).toUpperCase() + maintenanceRecord.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <TruckIcon className="h-4 w-4 mr-2" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-medium">{maintenanceRecord.equipment.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Model: {maintenanceRecord.equipment.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  SN: {maintenanceRecord.equipment.serial_number}
                </p>
              </div>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={route('equipment.show', maintenanceRecord.equipment.id)}>
                    View Equipment
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm">
                  <span className="font-medium">Scheduled:</span>{" "}
                  {format(parseISO(maintenanceRecord.scheduled_date), 'MMM d, yyyy')}
                </p>
                {maintenanceRecord.performed_date && (
                  <p className="text-sm">
                    <span className="font-medium">Performed:</span>{" "}
                    {format(parseISO(maintenanceRecord.performed_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={route('equipment.maintenance.schedule.edit', maintenanceRecord.id)}>
                    Reschedule
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="h-4 w-4 mr-2" />
                Technician
              </CardTitle>
            </CardHeader>
            <CardContent>
              {maintenanceRecord.performedBy ? (
                <div>
                  <p className="font-medium">{maintenanceRecord.performedBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {maintenanceRecord.performedBy.email}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No technician assigned</p>
              )}
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={route('equipment.maintenance.schedule.assign', maintenanceRecord.id)}>
                    {maintenanceRecord.performedBy ? 'Reassign' : 'Assign Technician'}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <MaintenanceParts
          maintenanceId={maintenanceRecord.id}
          parts={maintenanceRecord.parts}
          availableParts={availableParts}
          onSuccess={() => window.location.reload()}
        />

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" asChild>
            <a href={route('equipment.maintenance.show', maintenanceRecord.id)}>
              Back to Maintenance Details
            </a>
          </Button>
          {maintenanceRecord.status === 'scheduled' && (
            <Button asChild>
              <a href={route('equipment.maintenance.complete', maintenanceRecord.id)}>
                <WrenchIcon className="mr-2 h-4 w-4" />
                Mark as Completed
              </a>
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}


















