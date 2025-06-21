import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { CalendarIcon } from 'lucide-react';
import { AppLayout } from '@/Core';

// Minimal type definitions for build
type PageProps = { [key: string]: any };
type BreadcrumbItem = { title: string; href: string };

// Minimal type definitions for build
type Equipment = { id: number; name: string; model: string; door_number?: string };
type MaintenanceRecord = { id: number; equipment_id: number; type: string; description: string; status: string; scheduled_date: string; cost?: number; notes?: string };

interface Props extends PageProps {
  equipment: Equipment;
  maintenance: MaintenanceRecord;
}

type MaintenanceType = 'preventive' | 'repair' | 'inspection';

export default function MaintenanceEdit({ equipment, maintenance }: Props) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    maintenance.scheduled_date ? new Date(maintenance.scheduled_date) : undefined
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Equipment', href: route('equipment.index') },
    { title: equipment.name, href: route('equipment.show', equipment.id) },
    { title: 'Maintenance', href: route('equipment.maintenance.index', equipment.id) },
    { title: 'Record Details', href: route('equipment.maintenance.show', [equipment.id, maintenance.id]) },
    { title: 'Edit', href: route('equipment.maintenance.edit', [equipment.id, maintenance.id]) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    type: maintenance.type as MaintenanceType,
    description: maintenance.description || '',
    cost: maintenance.cost?.toString() || '0.00',
    scheduled_date: maintenance.scheduled_date || '',
    notes: maintenance.notes || '',
  });

  useEffect(() => {
    if (maintenance.scheduled_date) {
      setSelectedDate(new Date(maintenance.scheduled_date));
    }
  }, [maintenance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('equipment.maintenance.update', [equipment.id, maintenance.id]), {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Maintenance record updated successfully",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update maintenance record",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <AppLayout title="Edit Maintenance Record" breadcrumbs={breadcrumbs}>
      <Head title="Edit Maintenance Record" />
      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Maintenance Record</h1>
            <p className="text-muted-foreground">
              {equipment.door_number ? `#${equipment.door_number} - ` : ''}
              {equipment.name} - {equipment.model}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('equipment.maintenance.show', [equipment.id, maintenance.id])}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Record
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Maintenance Type</Label>
                  <Select
                    value={data.type}
                    onValueChange={(value) => setData('type', value as MaintenanceType)}
                    disabled={maintenance.status === 'completed' || maintenance.status === 'cancelled'}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Estimated Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.cost}
                    onChange={(e) => setData('cost', e.target.value)}
                  />
                  {errors.cost && <p className="text-sm text-red-500">{errors.cost}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={3}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                      disabled={maintenance.status === 'completed' || maintenance.status === 'cancelled'}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setData('scheduled_date', date ? format(date, 'yyyy-MM-dd') : '');
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.scheduled_date && <p className="text-sm text-red-500">{errors.scheduled_date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  rows={3}
                />
                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" asChild>
                  <Link href={route('equipment.maintenance.show', [equipment.id, maintenance.id])}>
                    Cancel
                  </Link>
                </Button>
                <Button
                  type="submit"
                  disabled={processing || maintenance.status === 'completed' || maintenance.status === 'cancelled'}
                >
                  Update Maintenance
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

















