import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

interface TechnicianData {
  technician: User;
  scheduled_count: number;
  schedule: MaintenanceRecord[];
}

interface TechnicianWorkloadProps {
  workload: TechnicianData[];
}

export function TechnicianWorkload({ workload }: TechnicianWorkloadProps) {
  const getProgressColor = (count: number) => {
    if (count <= 3) return 'bg-green-500';
    if (count <= 6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getWorkloadText = (count: number) => {
    if (count === 0) return 'No assignments';
    if (count <= 3) return 'Light workload';
    if (count <= 6) return 'Moderate workload';
    return 'Heavy workload';
  };

  const getWorkloadColor = (count: number) => {
    if (count === 0) return 'text-gray-500';
    if (count <= 3) return 'text-green-600';
    if (count <= 6) return 'text-amber-600';
    return 'text-red-600';
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {workload.length === 0 ? (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          No technicians assigned to maintenance tasks
        </div>
      ) : (
        workload.map((data) => (
          <Card key={data.technician.id} className="overflow-hidden">
            <div className="p-4 bg-muted flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={data.technician.profile_photo_url}
                  alt={data.technician.name}
                />
                <AvatarFallback>{data.technician.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{data.technician.name}</h3>
                <p className="text-sm text-muted-foreground">{data.technician.email}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Workload</span>
                  <span className={`text-sm font-medium ${getWorkloadColor(data.scheduled_count)}`}>
                    {getWorkloadText(data.scheduled_count)}
                  </span>
                </div>
                <Progress
                  value={Math.min(data.scheduled_count * 10, 100)}
                  className={getProgressColor(data.scheduled_count)}
                />
              </div>

              {data.scheduled_count === 0 ? (
                <p className="text-sm text-muted-foreground">No maintenance tasks scheduled</p>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Upcoming Maintenance ({data.scheduled_count})</h4>
                  <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {data.schedule.map((record) => (
                      <li key={record.id} className="text-sm border-l-2 border-blue-500 pl-3 py-1">
                        <div className="font-medium">{record.equipment.name}</div>
                        <div className="flex justify-between items-center mt-1">
                          <Badge className={getMaintenanceTypeColor(record.type)} variant="outline">
                            {record.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(record.scheduled_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

















