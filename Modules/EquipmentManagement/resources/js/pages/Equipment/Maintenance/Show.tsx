import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Separator,
} from '@/Core';
import { Head } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { toast } from 'sonner';
import { ArrowLeft as ArrowLeftIcon, CheckCircle as CheckCircleIcon, Edit as EditIcon, XCircle as XCircleIcon } from 'lucide-react';

// Inline type definitions
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
interface User {
    id: number;
    name: string;
}
interface MaintenanceRecord {
    id: number;
    type: string;
    status: string;
    cost: number;
    scheduled_date?: string;
    performed_date?: string;
    performedBy?: User;
    approvedBy?: User;
    equipment: Equipment;
    description?: string;
    notes?: string;
}

// Simple placeholder formatters
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
const formatDate = (date: string) => new Date(date).toLocaleDateString();

interface Props {
    maintenance: MaintenanceRecord & {
        equipment: Equipment;
        performedBy?: User;
        approvedBy?: User;
    };
}

// Define BreadcrumbItem inline
type BreadcrumbItem = {
    title: string;
    href: string;
};

export default function MaintenanceShow({ maintenance }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Equipment', href: route('equipment.index') },
        { title: maintenance.equipment.name, href: route('equipment.show', maintenance.equipment.id) },
        { title: 'Maintenance', href: route('equipment.maintenance.index', maintenance.equipment.id) },
        { title: 'Record Details', href: route('equipment.maintenance.show', [maintenance.equipment.id, maintenance.id]) },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled':
                return <Badge variant="outline">Scheduled</Badge>;
            case 'in_progress':
                return <Badge variant="secondary">In Progress</Badge>;
            case 'completed':
                return <Badge variant="default">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'preventive':
                return <Badge className="bg-blue-100 text-blue-800">Preventive</Badge>;
            case 'repair':
                return <Badge className="bg-red-100 text-red-800">Repair</Badge>;
            case 'inspection':
                return <Badge className="bg-green-100 text-green-800">Inspection</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const handleComplete = () => {
        Inertia.post(
            route('equipment.maintenance.complete', [maintenance.equipment.id, maintenance.id]),
            {},
            {
                onSuccess: () => {
                    toast.success('Maintenance record marked as completed');
                },
                onError: () => {
                    toast.error('Failed to complete maintenance record');
                },
            },
        );
    };

    const handleCancel = () => {
        Inertia.post(
            route('equipment.maintenance.cancel', [maintenance.equipment.id, maintenance.id]),
            {},
            {
                onSuccess: () => {
                    toast.success('Maintenance record cancelled');
                },
                onError: () => {
                    toast.error('Failed to cancel maintenance record');
                },
            },
        );
    };

    return (
        <AppLayout title="Maintenance Record" breadcrumbs={breadcrumbs}>
            <Head title="Maintenance Record" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Maintenance Record</h1>
                        <p className="text-muted-foreground">
                            {maintenance.equipment.door_number ? `#${maintenance.equipment.door_number} - ` : ''}
                            {maintenance.equipment.name} - {maintenance.equipment.model}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Records
                        </Button>
                        {maintenance.status === 'scheduled' && (
                            <Button variant="default" onClick={() => Inertia.get(route('equipment.maintenance.edit', [maintenance.equipment.id, maintenance.id]))}>
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit Record
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Maintenance Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="font-medium">Type:</span>
                                <span>{getTypeBadge(maintenance.type)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Status:</span>
                                <span>{getStatusBadge(maintenance.status)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Cost:</span>
                                <span>{formatCurrency(maintenance.cost)}</span>
                            </div>
                            {maintenance.scheduled_date && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Scheduled Date:</span>
                                    <span>{formatDate(maintenance.scheduled_date)}</span>
                                </div>
                            )}
                            {maintenance.performed_date && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Performed Date:</span>
                                    <span>{formatDate(maintenance.performed_date)}</span>
                                </div>
                            )}
                            {maintenance.performedBy && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Performed By:</span>
                                    <span>{maintenance.performedBy.name}</span>
                                </div>
                            )}
                            {maintenance.approvedBy && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Approved By:</span>
                                    <span>{maintenance.approvedBy.name}</span>
                                </div>
                            )}
                        </CardContent>
                        {maintenance.status === 'scheduled' && (
                            <div className="card-footer flex justify-between gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <XCircleIcon className="mr-2 h-4 w-4" />
                                            Cancel Maintenance
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Cancel Maintenance</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to cancel this maintenance record? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose>Cancel</DialogClose>
                                            <Button onClick={handleCancel}>Continue</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Button onClick={handleComplete}>
                                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                                    Mark as Completed
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description & Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="mb-2 text-lg font-semibold">Description</h3>
                                <p className="text-sm">{maintenance.description}</p>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="mb-2 text-lg font-semibold">Notes</h3>
                                <p className="text-sm">{maintenance.notes || 'No additional notes'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Equipment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">Equipment Details</h3>
                                <div>
                                    <span className="text-muted-foreground">Name: </span>
                                    <span>{maintenance.equipment.name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Model: </span>
                                    <span>{maintenance.equipment.model}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Serial: </span>
                                    <span>{maintenance.equipment.serial_number}</span>
                                </div>
                                {maintenance.equipment.door_number && (
                                    <div>
                                        <span className="text-muted-foreground">Door Number: </span>
                                        <span>{maintenance.equipment.door_number}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">Status Information</h3>
                                <div>
                                    <span className="text-muted-foreground">Status: </span>
                                    <span>{maintenance.equipment.status}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Category: </span>
                                    <span>{maintenance.equipment.category}</span>
                                </div>
                                {maintenance.equipment.purchase_date && (
                                    <div>
                                        <span className="text-muted-foreground">Purchase Date: </span>
                                        <span>{formatDate(maintenance.equipment.purchase_date)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">Actions</h3>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" onClick={() => Inertia.get(route('equipment.show', maintenance.equipment.id))}>View Equipment Details</Button>
                                    <Button variant="outline" onClick={() => Inertia.get(route('equipment.edit', maintenance.equipment.id))}>Edit Equipment</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
