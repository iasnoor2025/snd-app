import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Avatar, AvatarFallback, AvatarImage } from "@/Core";
import { Badge } from "@/Core";

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_url?: string;
  workload?: number;
}

interface TechnicianSelectorProps {
  technicians: User[];
  selectedTechnicianId: string;
  onSelect: (technicianId: string) => void;
}

export function TechnicianSelector({ technicians, selectedTechnicianId, onSelect }: TechnicianSelectorProps) {
  return (
    <Select
      value={selectedTechnicianId}
      onValueChange={onSelect}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Assign a technician" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Not assigned</SelectItem>
        {technicians.map((technician) => (
          <SelectItem key={technician.id} value={technician.id.toString()} className="py-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={technician.profile_photo_url} alt={technician.name} />
                <AvatarFallback>{technician.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{technician.name}</span>
                <span className="text-xs text-muted-foreground">
                  {technician.workload ? (
                    <Badge variant={getBadgeVariant(technician.workload)} className="text-xs">
                      {technician.workload} scheduled
                    </Badge>
                  ) : (
                    'No scheduled tasks'
                  )}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Helper function to determine badge variant based on workload
function getBadgeVariant(workload: number): 'default' | 'secondary' | 'destructive' {
  if (workload <= 3) return 'default';
  if (workload <= 6) return 'secondary';
  return 'destructive';
}

















