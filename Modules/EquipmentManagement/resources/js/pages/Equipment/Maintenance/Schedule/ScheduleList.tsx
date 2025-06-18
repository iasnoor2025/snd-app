import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Calendar, MoreHorizontal, WrenchIcon, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MaintenanceDetailView } from './MaintenanceDetailView';

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

interface ScheduleListProps {
  schedule: MaintenanceRecord[];
  technicians: User[];
  isConflict?: boolean;
}

export function ScheduleList({ schedule, technicians, isConflict = false }: ScheduleListProps) {
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Scheduled Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                {isConflict
                  ? "No scheduling conflicts found"
                  : "No maintenance records scheduled for this period"}
              </TableCell>
            </TableRow>
          ) : (
            schedule.map((record) => (
              <TableRow key={record.id} className={isConflict ? "bg-red-50" : ""}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{record.equipment.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {record.equipment.model} • SN: {record.equipment.serial_number}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getMaintenanceTypeColor(record.type)} variant="outline">
                    {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(parseISO(record.scheduled_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {isConflict && (
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <Badge className={getStatusColor(record.status)} variant="outline">
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {record.performedBy ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={record.performedBy.profile_photo_url}
                          alt={record.performedBy.name}
                        />
                        <AvatarFallback>{record.performedBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{record.performedBy.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not assigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedRecord(record);
                        setShowDetails(true);
                      }}>
                        <Calendar className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={route('equipment.maintenance.schedule.edit', record.id)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Reschedule
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={route('equipment.maintenance.schedule.assign', record.id)}>
                          <User className="mr-2 h-4 w-4" />
                          Assign Technician
                        </a>
                      </DropdownMenuItem>
                      {record.status === 'scheduled' && (
                        <DropdownMenuItem asChild>
                          <a href={route('equipment.maintenance.complete', record.id)}>
                            <WrenchIcon className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </a>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Maintenance Detail Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRecord && <MaintenanceDetailView record={selectedRecord} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
