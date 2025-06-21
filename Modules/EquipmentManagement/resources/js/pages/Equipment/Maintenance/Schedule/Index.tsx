import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ScheduleForm from './ScheduleForm';
import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleList } from './ScheduleList';
import { TechnicianWorkload } from './TechnicianWorkload';
import { PageBreadcrumb } from '../../../../components/PageBreadcrumb';

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
}

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
  workload?: number;
}

interface IndexProps {
  schedule: MaintenanceRecord[];
  workload: Array<{
    technician: User;
    scheduled_count: number;
    schedule: MaintenanceRecord[];
  }>;
  conflicts: MaintenanceRecord[];
  start_date: string;
  end_date: string;
  equipment: Equipment[];
  technicians: User[];
}

export default function Index({
  schedule,
  workload,
  conflicts,
  start_date,
  end_date,
  equipment,
  technicians,
}: IndexProps) {
  const [selectedTab, setSelectedTab] = useState('calendar');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date(start_date));
  const [endDate, setEndDate] = useState<Date>(new Date(end_date));

  const handleScheduleSuccess = () => {
    setIsDialogOpen(false);
    // You would typically refresh the page or data here
  };

  const breadcrumbItems = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Equipment', href: route('equipment.index') },
    { title: 'Maintenance', href: route('equipment.maintenance.index') },
    { title: 'Schedule', href: route('equipment.maintenance.schedule.index') },
  ];

  return (
    <AdminLayout>
      <Head title="Maintenance Schedule" />

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <PageBreadcrumb items={breadcrumbItems} />
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <DatePicker
                date={startDate}
                setDate={(date) => date && setStartDate(date)}
                placeholder="Start date"
              />
              <span>to</span>
              <DatePicker
                date={endDate}
                setDate={(date) => date && setEndDate(date)}
                placeholder="End date"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                {selectedEquipment ? (
                  <ScheduleForm
                    equipment={selectedEquipment}
                    technicians={technicians}
                    onSuccess={handleScheduleSuccess}
                  />
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium">Select Equipment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                      {equipment.map((item) => (
                        <Card
                          key={item.id}
                          className="cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => setSelectedEquipment(item)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.model}</p>
                            <p className="text-sm">SN: {item.serial_number}</p>
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                {item.status}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="technicians">Technician Workload</TabsTrigger>
            {conflicts.length > 0 && (
              <TabsTrigger value="conflicts" className="relative">
                Conflicts
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conflicts.length}
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleCalendar
                  schedule={schedule}
                  startDate={startDate}
                  endDate={endDate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleList
                  schedule={schedule}
                  technicians={technicians}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technicians" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Technician Workload</CardTitle>
              </CardHeader>
              <CardContent>
                <TechnicianWorkload workload={workload} />
              </CardContent>
            </Card>
          </TabsContent>

          {conflicts.length > 0 && (
            <TabsContent value="conflicts" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Conflicts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScheduleList
                    schedule={conflicts}
                    technicians={technicians}
                    isConflict={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
}


















