import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../Core/resources/js/components/ui/card';
import { Badge } from '../../../../../Core/resources/js/components/ui/badge';
import { Button } from '../../../../../Core/resources/js/components/ui/button';
import { Calendar, MapPin, Clock, User, Building } from 'lucide-react';
import { format } from 'date-fns';

interface Assignment {
  id: number;
  project_name: string;
  role: string;
  department: string;
  location: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'terminated';
  supervisor: string;
  description?: string;
}

interface AssignmentHistoryProps {
  employeeId: number;
  assignments?: Assignment[];
  onViewDetails?: (assignmentId: number) => void;
}

export const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({
  employeeId,
  assignments = [],
  onViewDetails
}) => {
  // Mock data for demonstration
  const mockAssignments: Assignment[] = [
    {
      id: 1,
      project_name: 'Downtown Office Construction',
      role: 'Site Engineer',
      department: 'Engineering',
      location: 'Downtown District',
      start_date: '2024-01-15',
      end_date: null,
      status: 'active',
      supervisor: 'John Smith',
      description: 'Leading site engineering activities for the new office complex'
    },
    {
      id: 2,
      project_name: 'Residential Complex Phase 2',
      role: 'Assistant Engineer',
      department: 'Engineering',
      location: 'Suburb Area',
      start_date: '2023-06-01',
      end_date: '2023-12-31',
      status: 'completed',
      supervisor: 'Sarah Johnson',
      description: 'Assisted in construction supervision and quality control'
    },
    {
      id: 3,
      project_name: 'Highway Bridge Repair',
      role: 'Junior Engineer',
      department: 'Engineering',
      location: 'Highway 101',
      start_date: '2023-03-01',
      end_date: '2023-05-30',
      status: 'completed',
      supervisor: 'Mike Davis',
      description: 'Structural assessment and repair supervision'
    }
  ];

  const displayAssignments = assignments.length > 0 ? assignments : mockAssignments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (displayAssignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Assignment History
          </CardTitle>
          <CardDescription>
            Track employee's project assignments and roles over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No assignment history found for this employee.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Assignment History
        </CardTitle>
        <CardDescription>
          Track employee's project assignments and roles over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-lg">{assignment.project_name}</h4>
                <p className="text-sm text-muted-foreground">{assignment.description}</p>
              </div>
              <Badge className={getStatusColor(assignment.status)}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Role:</span>
                  <span>{assignment.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Department:</span>
                  <span>{assignment.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{assignment.location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Start Date:</span>
                  <span>{formatDate(assignment.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">End Date:</span>
                  <span>{assignment.end_date ? formatDate(assignment.end_date) : 'Ongoing'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Supervisor:</span>
                  <span>{assignment.supervisor}</span>
                </div>
              </div>
            </div>

            {assignment.end_date && assignment.start_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Duration: {Math.ceil(
                    (new Date(assignment.end_date).getTime() - new Date(assignment.start_date).getTime()) 
                    / (1000 * 60 * 60 * 24 * 30)
                  )} months
                </span>
              </div>
            )}

            {onViewDetails && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(assignment.id)}
                >
                  View Details
                </Button>
              </div>
            )}
          </div>
        ))}

        {displayAssignments.length > 5 && (
          <div className="text-center pt-4">
            <Button variant="outline">
              Load More Assignments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
