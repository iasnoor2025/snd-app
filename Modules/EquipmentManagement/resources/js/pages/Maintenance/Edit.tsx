import {
    AppLayout,
    Button,
    Calendar,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Popover,
    PopoverContent,
    PopoverTrigger,
    RadioGroup,
    RadioGroupItem,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Textarea,
    useToast,
} from '@/Core';
import { PageProps } from '@/Core/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, CalendarIcon, Minus, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Props extends PageProps {
    maintenanceRecord: MaintenanceRecord & {
        maintenanceParts?: MaintenancePart[];
    };
    equipment: Equipment[];
    employees: any[];
    inventoryItems: any[];
}

// Placeholder types
type Equipment = any;
type MaintenancePart = any;
type MaintenanceRecord = any;

export default function Edit({ auth, maintenanceRecord, equipment, employees, inventoryItems }: Props) {
    const { toast } = useToast();
    const [selectedParts, setSelectedParts] = useState<{ id: number; quantity: number; cost: number; part_id?: number }[]>([]);
    const [maintenanceDate, setMaintenanceDate] = useState<Date | undefined>(
        maintenanceRecord.maintenance_date ? new Date(maintenanceRecord.maintenance_date) : undefined,
    );
    const [nextMaintenanceDate, setNextMaintenanceDate] = useState<Date | undefined>(
        maintenanceRecord.next_maintenance_date ? new Date(maintenanceRecord.next_maintenance_date) : undefined,
    );

    const { put, processing, errors, setData, data } = useForm({
        equipment_id: maintenanceRecord.equipment_id.toString(),
        type: maintenanceRecord.maintenance_type,
        status: maintenanceRecord.status,
        maintenance_date: maintenanceRecord.maintenance_date,
        description: maintenanceRecord.description,
        performed_by: maintenanceRecord.performed_by ? maintenanceRecord.performed_by.toString() : '',
        cost: maintenanceRecord.cost,
        next_maintenance_date: maintenanceRecord.next_maintenance_date,
        notes: maintenanceRecord.notes || '',
        parts: [] as any[],
    });

    useEffect(() => {
        // Initialize selected parts from maintenanceRecord.maintenanceParts
        if (maintenanceRecord.maintenanceParts && maintenanceRecord.maintenanceParts.length > 0) {
            const initialParts = maintenanceRecord.maintenanceParts.map((part) => ({
                id: part.id,
                part_id: part.id,
                quantity: part.quantity,
                cost: part.unit_cost,
            }));
            setSelectedParts(initialParts);
        }
    }, [maintenanceRecord]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Update the parts data before submitting
        const formattedParts = selectedParts.map((part) => {
            const selectedItem = inventoryItems.find((item) => item.id === part.id);
            return {
                id: part.part_id, // Include the existing part ID if it exists
                part_name: selectedItem ? selectedItem.name : 'Unknown Part',
                part_number: selectedItem ? selectedItem.part_number : '',
                quantity: part.quantity,
                unit_cost: part.cost,
                inventory_item_id: part.id || null,
                supplier: selectedItem ? selectedItem.supplier : '',
                notes: '',
            };
        });

        setData('parts', formattedParts);

        // Make sure we have a valid equipment_id
        if (!data.equipment_id) {
            toast({
                title: 'Error',
                description: 'Please select equipment',
                variant: 'destructive',
            });
            return;
        }

        // Make sure we have a valid description
        if (!data.description) {
            toast({
                title: 'Error',
                description: 'Please enter a description',
                variant: 'destructive',
            });
            return;
        }

        // Use setTimeout to ensure data is updated before submitting
        setTimeout(() => {
            put(route('maintenance.update', maintenanceRecord.id), {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Maintenance record updated successfully',
                    });
                    window.location.href = route('maintenance.index');
                },
                onError: (errors) => {
                    toast({
                        title: 'Error',
                        description: 'Failed to update maintenance record. Please check the form for errors.',
                        variant: 'destructive',
                    });
                },
            });
        }, 100);
    };

    const addPart = () => {
        setSelectedParts([...selectedParts, { id: 0, quantity: 1, cost: 0 }]);
    };

    const removePart = (index: number) => {
        const newParts = [...selectedParts];
        newParts.splice(index, 1);
        setSelectedParts(newParts);
    };

    const updatePartField = (index: number, field: string, value: any) => {
        const newParts = [...selectedParts];
        newParts[index] = { ...newParts[index], [field]: value };
        setSelectedParts(newParts);

        // If part ID changed, update cost from inventory items list
        if (field === 'id') {
            const selectedItem = inventoryItems.find((item) => item.id === parseInt(value));
            if (selectedItem) {
                newParts[index].cost = selectedItem.unit_cost || 0;
                setSelectedParts(newParts);
            }
        }
    };

    const calculateTotalCost = () => {
        const partsCost = selectedParts.reduce((sum, part) => sum + part.cost * part.quantity, 0);
        return partsCost;
    };

    return (
        <AppLayout
            title={`Edit Maintenance Record #${maintenanceRecord.id}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Maintenance', href: '/maintenance' },
                { title: `Record #${maintenanceRecord.id}`, href: `/maintenance/${maintenanceRecord.id}` },
                { title: 'Edit', href: `/maintenance/${maintenanceRecord.id}/edit` },
            ]}
        >
            <Head title="Edit Maintenance Record" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">Edit Maintenance Record</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('maintenance.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Maintenance Records
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="equipment_id">
                                        Equipment <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.equipment_id} onValueChange={(value) => setData('equipment_id', value)}>
                                        <SelectTrigger id="equipment_id" className={errors.equipment_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select equipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {equipment.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.name} - {item.serial_number}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.equipment_id && <p className="text-sm text-red-500">{errors.equipment_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">
                                        Maintenance Type <span className="text-red-500">*</span>
                                    </Label>
                                    <RadioGroup value={data.type} onValueChange={(value) => setData('type', value)} className="flex space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="routine" id="routine" />
                                            <Label htmlFor="routine">Routine</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="repair" id="repair" />
                                            <Label htmlFor="repair">Repair</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="inspection" id="inspection" />
                                            <Label htmlFor="inspection">Inspection</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="other" id="other" />
                                            <Label htmlFor="other">Other</Label>
                                        </div>
                                    </RadioGroup>
                                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        Status <span className="text-red-500">*</span>
                                    </Label>
                                    <RadioGroup
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                        className="flex flex-wrap gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="scheduled" id="scheduled" />
                                            <Label htmlFor="scheduled">Scheduled</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="in_progress" id="in_progress" />
                                            <Label htmlFor="in_progress">In Progress</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="completed" id="completed" />
                                            <Label htmlFor="completed">Completed</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="cancelled" id="cancelled" />
                                            <Label htmlFor="cancelled">Cancelled</Label>
                                        </div>
                                    </RadioGroup>
                                    {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maintenance_date">
                                        Maintenance Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${errors.maintenance_date ? 'border-red-500' : ''}`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {maintenanceDate ? format(maintenanceDate, 'PPP') : <span>Select date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={maintenanceDate}
                                                onSelect={(date) => {
                                                    setMaintenanceDate(date);
                                                    setData('maintenance_date', date ? format(date, 'yyyy-MM-dd') : '');
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.maintenance_date && <p className="text-sm text-red-500">{errors.maintenance_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="performed_by">Technician</Label>
                                    <Select value={data.performed_by} onValueChange={(value) => setData('performed_by', value)}>
                                        <SelectTrigger id="performed_by" className={errors.performed_by ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select technician" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                                    {employee.first_name} {employee.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.performed_by && <p className="text-sm text-red-500">{errors.performed_by}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="next_maintenance_date">Next Maintenance Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${errors.next_maintenance_date ? 'border-red-500' : ''}`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {nextMaintenanceDate ? format(nextMaintenanceDate, 'PPP') : <span>Select date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={nextMaintenanceDate}
                                                onSelect={(date) => {
                                                    setNextMaintenanceDate(date);
                                                    setData('next_maintenance_date', date ? format(date, 'yyyy-MM-dd') : '');
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.next_maintenance_date && <p className="text-sm text-red-500">{errors.next_maintenance_date}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    className={errors.notes ? 'border-red-500' : ''}
                                />
                                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                            </div>

                            <Separator />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Parts Used</h3>
                                    <Button type="button" onClick={addPart} variant="outline" size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Part
                                    </Button>
                                </div>

                                {selectedParts.map((part: any, index: number) => (
                                    <div key={index} className="grid grid-cols-1 items-end gap-4 rounded-md border p-4 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label>Part</Label>
                                            <Select
                                                value={part.id.toString()}
                                                onValueChange={(value) => updatePartField(index, 'id', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select part" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {inventoryItems.map((item) => (
                                                        <SelectItem key={item.id} value={item.id.toString()}>
                                                            {item.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={part.quantity}
                                                onChange={(e) => updatePartField(index, 'quantity', parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Unit Cost</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={part.cost}
                                                onChange={(e) => updatePartField(index, 'cost', parseFloat(e.target.value))}
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <Button type="button" onClick={() => removePart(index)} variant="destructive" size="sm">
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <div className="text-right font-medium">
                                    Total Parts Cost:{' '}
                                    {new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(calculateTotalCost())}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" asChild>
                                    <Link href={route('maintenance.show', maintenanceRecord.id)}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Update Maintenance Record
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
