import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
// Define PageProps inline if needed
type PageProps = Record<string, unknown>;
import { AdminLayout } from '@/Modules/Core/resources/js';
// Define Equipment inline if needed
interface Equipment {
  id: number;
  name: string;
  model: string;
  serial_number?: string;
  status?: string;
  category?: string;
  purchase_date?: string;
  door_number?: string;
}
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Modules/Core/resources/js/components/ui/card';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import { Textarea } from '@/Modules/Core/resources/js/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Modules/Core/resources/js/components/ui/select';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { useToast } from '@/Modules/Core/resources/js/components/ui/use-toast';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/Modules/Core/resources/js/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Modules/Core/resources/js/components/ui/popover';
import { Calendar } from '@/Modules/Core/resources/js/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/Modules/Core/resources/js/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/Modules/Core/resources/js/components/ui/dialog';
import { Separator } from '@/Modules/Core/resources/js/components/ui/separator';
// Define BreadcrumbItem inline
type BreadcrumbItem = { title: string; href: string };

interface Props extends PageProps {
  equipment: Equipment;
}

type MaintenanceType = 'preventive' | 'repair' | 'inspection';

export default function MaintenanceCreate({ equipment }: Props) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Equipment', href: route('equipment.index') },
    { title: equipment.name, href: route('equipment.show', equipment.id) },
    { title: 'Maintenance', href: route('equipment.maintenance.index', equipment.id) },
    { title: 'Schedule New', href: route('equipment.maintenance.create', equipment.id) },
  ];

  const { data, setData, post, processing, errors } = useForm({
    type: 'preventive' as MaintenanceType,
    description: '',
    cost: '0.00',
    scheduled_date: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('equipment.maintenance.store', equipment.id), {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Maintenance record scheduled successfully",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to schedule maintenance record",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <AdminLayout title="Schedule Maintenance" breadcrumbs={breadcrumbs}>
      <Head title="Schedule Maintenance" />

      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule Maintenance</h1>
            <p className="text-muted-foreground">
              {equipment.door_number ? `#${equipment.door_number} - ` : ''}
              {equipment.name} - {equipment.model}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('equipment.maintenance.index', equipment.id)}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Records
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
                  <Link href={route('equipment.maintenance.index', equipment.id)}>
                    Cancel
                  </Link>
                </Button>
                <Button type="submit" disabled={processing}>
                  Schedule Maintenance
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

















