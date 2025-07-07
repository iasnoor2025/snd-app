import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, useForm, Link } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Button } from "@/Core";
import { Textarea } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Calendar } from "@/Core";
import { Popover, PopoverContent, PopoverTrigger } from "@/Core";
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft, Save } from 'lucide-react';
import { cn } from "@/Core";
import { Separator } from "@/Core";
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Customer {
    id: number;
    company_name: string;
}

interface Project {
    id: number;
    name: string;
    description: string;
    client: Customer;
    customer_id: number;
    start_date: string;
    end_date: string | null;
    status: string;
    budget: number;
    notes: string | null;
}

interface Location {
    id: number;
    name: string;
    city: string;
    state: string;
}

interface Props {
    project: any;
    manager?: any;
    tasks?: any[];
    teamMembers?: any[];
    client?: any;
    location?: any;
    customers?: any[];
    locations?: any[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

// Declare window.route for TypeScript
// @ts-ignore
// eslint-disable-next-line
declare global { interface Window { route: any; } }

export default function Edit({ project, manager = {}, tasks = [], teamMembers = [], client = {}, location = {}, customers = [], locations = [], created_at, updated_at, deleted_at }: Props) {
  const { t } = useTranslation('project');

    // Deduplicate locations based on name, city, and state
    const uniqueLocations = React.useMemo(() => {
        const seen = new Set();
        return locations.filter(location => {
            const key = `${location.name}-${location.city}-${location.state}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }, [locations]);

    const { data, setData, put, processing, errors } = useForm({
        name: project.name || '',
        description: project.description || '',
        customer_id: project.customer_id ? project.customer_id.toString() : '',
        location_id: project.location_id ? project.location_id.toString() : '',
        start_date: project.start_date ? new Date(project.start_date) : new Date(),
        end_date: project.end_date ? new Date(project.end_date) : null,
        status: project.status || 'active',
        budget: project.budget ? project.budget.toString() : '',
        notes: project.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('projects.update', project.id));
    };

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Projects', href: '/projects' },
        { title: `Edit ${project.name}`, href: window.location.pathname },
    ];

    return (
        <AppLayout title={t('edit_project', { name: project.name })} breadcrumbs={breadcrumbs} requiredPermission="projects.edit">
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex flex-col space-y-2">
                    <Link href={route('projects.show', project.id)} className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        {t('back_to_project')}
                    </Link>

                    <h1 className="text-3xl font-bold tracking-tight">{t('edit_project')}</h1>
                    <p className="text-muted-foreground">{t('update_project_details', { name: project.name })}</p>
                </div>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">{t('ttl_project_details')}</CardTitle>
                        <CardDescription>{t('basic_information_about_the_project')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('lbl_project_name')}</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('ph_enter_project_name')}
                                        className="w-full"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customer_id">Customer</Label>
                                    <Select
                                        value={data.customer_id}
                                        onValueChange={(value) => setData('customer_id', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t('ph_select_customer')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.company_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_id && (
                                        <p className="text-sm text-destructive">{errors.customer_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location_id">Location</Label>
                                    <Select
                                        value={data.location_id}
                                        onValueChange={(value) => setData('location_id', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t('ph_select_location')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {uniqueLocations.map((location) => (
                                                <SelectItem key={location.id} value={location.id.toString()}>
                                                    {`${location.name} - ${location.city}, ${location.state}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.location_id && (
                                        <p className="text-sm text-destructive">{errors.location_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">{t('lbl_start_date')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !data.start_date && 'text-muted-foreground'
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.start_date ? (
                                                    format(data.start_date, 'PPP')
                                                ) : (
                                                    <span>{t('pick_a_date')}</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formatDateMedium(data.start_date)}
                                                onSelect={(date) => setData('start_date', date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">{errors.start_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date (Optional)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !data.end_date && 'text-muted-foreground'
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.end_date ? (
                                                    format(data.end_date, 'PPP')
                                                ) : (
                                                    <span>{t('pick_a_date')}</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formatDateMedium(data.end_date)}
                                                onSelect={(date) => setData('end_date', date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">{errors.end_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t('ph_select_status')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-destructive">{errors.status}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', e.target.value)}
                                        placeholder={t('ph_enter_project_budget')}
                                        className="w-full"
                                        required
                                    />
                                    {errors.budget && (
                                        <p className="text-sm text-destructive">{errors.budget}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder={t('ph_enter_project_description')}
                                        rows={4}
                                        className="resize-none"
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder={t('ph_enter_any_additional_notes')}
                                        rows={3}
                                        className="resize-none"
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-destructive">{errors.notes}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Project
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}















