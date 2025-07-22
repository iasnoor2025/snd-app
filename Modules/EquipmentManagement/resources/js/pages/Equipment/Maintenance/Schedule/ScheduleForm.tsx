import {
    Alert,
    AlertDescription,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DatePicker,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@/Core';
import { Equipment, User } from '@/Core/types/models';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { TechnicianSelector } from './TechnicianSelector';

interface ScheduleFormProps {
    equipment: Equipment;
    technicians: User[];
    onSuccess?: () => void;
}

export default function ScheduleForm({ equipment, technicians, onSuccess }: ScheduleFormProps) {
    const [isRecurring, setIsRecurring] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'preventive',
        description: '',
        scheduled_date: '',
        is_recurring: false,
        interval_days: '30',
        occurrences: '3',
        technician_id: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('equipment.maintenance.schedule.store', equipment.id), {
            onSuccess: () => {
                reset();
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Schedule Maintenance for {equipment.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="type">Maintenance Type</Label>
                        <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select a maintenance type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="preventive">Preventive</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Describe the maintenance to be performed"
                            rows={3}
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                    </div>

                    <div>
                        <Label htmlFor="scheduled_date">Scheduled Date</Label>
                        <DatePicker
                            id="scheduled_date"
                            date={data.scheduled_date ? new Date(data.scheduled_date) : undefined}
                            onSelect={(date: { toISOString: () => string }) => setData('scheduled_date', date?.toISOString() || '')}
                            placeholder="Select a date"
                        />
                        {errors.scheduled_date && <p className="mt-1 text-sm text-red-500">{errors.scheduled_date}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* <Switch
                            id="is_recurring"
                            checked={isRecurring}
                            onCheckedChange={(checked) => {
                                setIsRecurring(checked);
                                setData('is_recurring', checked as boolean);
                            }}
                        /> */}
                        {/* <Label htmlFor="is_recurring">Recurring Maintenance</Label> */}
                    </div>

                    {isRecurring && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="interval_days">Interval (Days)</Label>
                                <Input
                                    id="interval_days"
                                    type="number"
                                    min="1"
                                    value={data.interval_days}
                                    onChange={(e) => setData('interval_days', e.target.value)}
                                />
                                {errors.interval_days && <p className="mt-1 text-sm text-red-500">{errors.interval_days}</p>}
                            </div>
                            <div>
                                <Label htmlFor="occurrences">Number of Occurrences</Label>
                                <Input
                                    id="occurrences"
                                    type="number"
                                    min="1"
                                    max="52"
                                    value={data.occurrences}
                                    onChange={(e) => setData('occurrences', e.target.value)}
                                />
                                {errors.occurrences && <p className="mt-1 text-sm text-red-500">{errors.occurrences}</p>}
                            </div>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="technician">Assign Technician (Optional)</Label>
                        <TechnicianSelector
                            technicians={technicians}
                            selectedTechnicianId={data.technician_id}
                            onSelect={(technicianId) => setData('technician_id', technicianId)}
                        />
                        {errors.technician_id && <p className="mt-1 text-sm text-red-500">{errors.technician_id}</p>}
                    </div>

                    <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Any additional notes about this maintenance"
                            rows={2}
                        />
                        {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes}</p>}
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>Please fix the errors above before submitting the form.</AlertDescription>
                        </Alert>
                    )}
                </form>
            </CardContent>
            <div className="card-footer flex justify-end space-x-2">
                <Button variant="outline" onClick={() => reset()}>
                    Cancel
                </Button>
                <Button type="submit" onClick={handleSubmit} disabled={processing}>
                    {processing ? 'Scheduling...' : 'Schedule Maintenance'}
                </Button>
            </div>
        </Card>
    );
}
