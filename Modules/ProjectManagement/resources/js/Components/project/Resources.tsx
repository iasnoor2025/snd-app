import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResourceList from "./ResourceList";
import ResourceSearch from "./ResourceSearch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import ResourceForm from "./ResourceForm";
import { X, Filter, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type ResourceType = 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense';

interface Resource {
    id: number;
    type: ResourceType;
    [key: string]: any;
}

interface FilterState {
    search: string;
    dateRange: {
        start: string;
        end: string;
    };
    status: string[];
    costRange: {
        min: string;
        max: string;
    };
    type: string[];
}

interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}

export default function Resources({ project }: { project: any }) {
  const { t } = useTranslation('project');

    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ResourceType>("manpower");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [dialogType, setDialogType] = useState<ResourceType>("manpower");
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        dateRange: {
            start: "",
            end: "",
        },
        status: [],
        costRange: {
            min: "",
            max: "",
        },
        type: [],
    })
    const [showFilters, setShowFilters] = useState(false);
    const [sort, setSort] = useState<SortState>({
        key: '',
        direction: 'asc'
    })

    // Memoize fetchResources to prevent unnecessary re-renders
    const fetchResources = useCallback(async () => {
        if (!project?.id) return;

        setLoading(true);
        try {
            const response = await axios.get(`/api/projects/${project.id}/resources`);
            setResources(response.data.data || []);
        } catch (error) {
            console.error("Error fetching resources:", error);
            toast({
                title: "Error",
                description: "Failed to load resources.",
                variant: "destructive",
            })
        } finally {
            setLoading(false);
        }
    }, [project?.id]);

    // Fetch resources when project ID changes
    useEffect(() => {
        if (project?.id) {
            fetchResources();
        }
    }, [fetchResources, project?.id]);

    // Memoize getResourcesByType to prevent unnecessary recalculations
    const getResourcesByType = useCallback((type: ResourceType) => {
        let filteredResources = resources.filter(resource => resource?.type === type);

        // Apply search filter
        if (filters.search) {
            const query = filters.search.toLowerCase();
            filteredResources = filteredResources.filter(resource => {
                return Object.entries(resource).some(([key, value]) => {
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(query);
                    }
                    if (value && typeof value === 'object') {
                        return Object.values(value).some(nestedValue =>
                            typeof nestedValue === 'string' &&
                            nestedValue.toLowerCase().includes(query)
                        );
                    }
                    return false;
                })
            })
        }

        // Apply date range filter
        if (filters.dateRange.start || filters.dateRange.end) {
            filteredResources = filteredResources.filter(resource => {
                const resourceDate = new Date(resource.start_date || resource.date);
                const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
                const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

                if (startDate && endDate) {
                    return resourceDate >= startDate && resourceDate <= endDate;
                } else if (startDate) {
                    return resourceDate >= startDate;
                } else if (endDate) {
                    return resourceDate <= endDate;
                }
                return true;
            })
        }

        // Apply cost range filter
        if (filters.costRange.min || filters.costRange.max) {
            filteredResources = filteredResources.filter(resource => {
                const cost = parseFloat(resource.total_cost || resource.amount || 0);
                const minCost = filters.costRange.min ? parseFloat(filters.costRange.min) : 0;
                const maxCost = filters.costRange.max ? parseFloat(filters.costRange.max) : Infinity;

                return cost >= minCost && cost <= maxCost;
            })
        }

        // Apply status filter
        if (filters.status.length > 0) {
            filteredResources = filteredResources.filter(resource =>
                filters.status.includes(resource.status)
            );
        }

        // Apply sorting
        if (sort.key) {
            filteredResources.sort((a, b) => {
                // Handle nested object properties (e.g., 'equipment.name')
                const getNestedValue = (obj: any, path: string) => {
                    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
                };

                let valueA = getNestedValue(a, sort.key);
                let valueB = getNestedValue(b, sort.key);

                // Handle special cases for manpower resources
                if (sort.key === 'worker_name') {
                    valueA = a.employee_id ?
                        `${a.employee?.first_name || ''} ${a.employee?.last_name || ''}`.trim() :
                        a.worker_name;
                    valueB = b.employee_id ?
                        `${b.employee?.first_name || ''} ${b.employee?.last_name || ''}`.trim() :
                        b.worker_name;
                }

                // Handle numeric values
                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return sort.direction === 'asc' ? valueA - valueB : valueB - valueA;
                }

                // Handle dates
                if (valueA instanceof Date && valueB instanceof Date) {
                    return sort.direction === 'asc'
                        ? valueA.getTime() - valueB.getTime()
                        : valueB.getTime() - valueA.getTime();
                }

                // Handle string dates
                if (sort.key === 'start_date' || sort.key === 'date') {
                    const dateA = valueA ? new Date(valueA).getTime() : 0;
                    const dateB = valueB ? new Date(valueB).getTime() : 0;
                    return sort.direction === 'asc' ? dateA - dateB : dateB - dateA;
                }

                // Handle currency values
                if (sort.key.includes('cost') || sort.key.includes('rate') || sort.key.includes('amount')) {
                    const numA = parseFloat(valueA) || 0;
                    const numB = parseFloat(valueB) || 0;
                    return sort.direction === 'asc' ? numA - numB : numB - numA;
                }

                // Handle strings
                const stringA = String(valueA || '').toLowerCase();
                const stringB = String(valueB || '').toLowerCase();
                return sort.direction === 'asc'
                    ? stringA.localeCompare(stringB)
                    : stringB.localeCompare(stringA);
            })
        }

        return filteredResources;
    }, [resources, filters, sort]);

    // Memoize handleAddResource to prevent unnecessary re-renders
    const handleAddResource = useCallback(() => {
        setEditingResource(null);
        setDialogType(activeTab);
        setDialogOpen(true);
    }, [activeTab]);

    // Memoize handleEditResource to prevent unnecessary re-renders
    const handleEditResource = useCallback((resource: Resource) => {
        if (!resource) return;
        setEditingResource(resource);
        setDialogType(resource.type);
        setDialogOpen(true);
    }, []);

    // Memoize handleDeleteResource to prevent unnecessary re-renders
    const handleDeleteResource = useCallback(async (resource: Resource) => {
        if (!resource || !project?.id) return;

        if (!confirm(`Are you sure you want to delete this ${resource.type} resource?`)) {
            return;
        }

        try {
            await axios.delete(`/api/projects/${project.id}/resources/${resource.type}/${resource.id}`, {
                data: { type: resource.type }
            })
            toast({
                title: "Success",
                description: `The ${resource.type} resource has been deleted.`,
            })
            await fetchResources();
        } catch (error) {
            console.error("Error deleting resource:", error);
            toast({
                title: "Error",
                description: "Failed to delete resource.",
                variant: "destructive",
            })
        }
    }, [project?.id, fetchResources]);

    // Memoize handleDialogClose to prevent unnecessary re-renders
    const handleDialogClose = useCallback(() => {
        setDialogOpen(false);
        setEditingResource(null);
    }, []);

    // Memoize handleSuccess to prevent unnecessary re-renders
    const handleSuccess = useCallback(async () => {
        await fetchResources();
        handleDialogClose();
    }, [fetchResources, handleDialogClose]);

    // Memoize handleTabChange to prevent unnecessary re-renders
    const handleTabChange = useCallback((value: string) => {
        const newType = value as ResourceType;
        setActiveTab(newType);
        setDialogType(newType);
    }, []);

    // Memoize getDialogTitle to prevent unnecessary recalculations
    const getDialogTitle = useCallback(() => {
        const action = editingResource ? 'Edit' : 'Add';
        switch (dialogType) {
            case 'manpower': return `${action} Manpower Resource`;
            case 'equipment': return `${action} Equipment Resource`;
            case 'material': return `${action} Material Resource`;
            case 'fuel': return `${action} Fuel Usage`;
            case 'expense': return `${action} Expense`;
            default: return `${action} Resource`;
        }
    }, [dialogType, editingResource]);

    // Memoize renderLoadingSkeleton to prevent unnecessary re-renders
    const renderLoadingSkeleton = useCallback(() => (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    ), []);

    // Memoize the resource types array
    const resourceTypes = useMemo(() =>
        ['manpower', 'equipment', 'material', 'fuel', 'expense'] as ResourceType[],
        []
    );

    // Memoize the dialog content to prevent unnecessary re-renders
    const dialogContent = useCallback(() => (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle>{getDialogTitle()}</DialogTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0"
                    onClick={handleDialogClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </DialogHeader>
            <DialogDescription>
                {editingResource
                    ? `Update the details for this ${dialogType} resource`
                    : `Add a new ${dialogType} resource to this project`}
            </DialogDescription>
            <ResourceForm
                type={dialogType}
                projectId={project.id}
                onSuccess={handleSuccess}
                initialData={editingResource}
                key={`${dialogType}-form-${editingResource?.id || 'new'}`}
            />
        </DialogContent>
    ), [dialogType, editingResource, getDialogTitle, handleDialogClose, handleSuccess, project.id]);

    const handleFilterChange = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            search: "",
            dateRange: {
                start: "",
                end: "",
            },
            status: [],
            costRange: {
                min: "",
                max: "",
            },
            type: [],
        })
    };

    const handleSort = (key: string) => {
        setSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key: string) => {
        if (sort.key !== key) return <ArrowUpDown className="h-4 w-4" />
        return sort.direction === 'asc'
            ? <ArrowUp className="h-4 w-4" />
            : <ArrowDown className="h-4 w-4" />
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Resources</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleAddResource}>Add Resource</Button>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <ResourceSearch
                    value={filters.search}
                    onChange={(value) => handleFilterChange('search', value)}
                    placeholder={`Search ${activeTab} resources...`}
                />

                {showFilters && (
                    <Card className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>{t('date_range')}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="date"
                                        value={filters.dateRange.start}
                                        onChange={(e) => handleFilterChange('dateRange', {
                                            ...filters.dateRange,
                                            start: e.target.value
                                        })}
                                        placeholder={t('lbl_start_date')}
                                    />
                                    <Input
                                        type="date"
                                        value={filters.dateRange.end}
                                        onChange={(e) => handleFilterChange('dateRange', {
                                            ...filters.dateRange,
                                            end: e.target.value
                                        })}
                                        placeholder={t('end_date')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Cost Range (SAR)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        value={filters.costRange.min}
                                        onChange={(e) => handleFilterChange('costRange', {
                                            ...filters.costRange,
                                            min: e.target.value
                                        })}
                                        placeholder={t('ph_min')}
                                    />
                                    <Input
                                        type="number"
                                        value={filters.costRange.max}
                                        onChange={(e) => handleFilterChange('costRange', {
                                            ...filters.costRange,
                                            max: e.target.value
                                        })}
                                        placeholder={t('ph_max')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {filters.status.length > 0
                                                ? `${filters.status.length} selected`
                                                : "Select status"}
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {['Active', 'Completed', 'Pending', 'Cancelled'].map((status) => (
                                            <DropdownMenuCheckboxItem
                                                key={status}
                                                checked={filters.status.includes(status)}
                                                onCheckedChange={(checked) => {
                                                    const newStatus = checked
                                                        ? [...filters.status, status]
                                                        : filters.status.filter(s => s !== status);
                                                    handleFilterChange('status', newStatus);
                                                }}
                                            >
                                                {status}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="w-full"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                    {resourceTypes.map((type) => (
                        <TabsTrigger key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {resourceTypes.map((type) => (
                    <TabsContent key={type} value={type}>
                        {loading ? (
                            renderLoadingSkeleton()
                        ) : (
                            <ResourceList
                                resources={getResourcesByType(type)}
                                onEdit={handleEditResource}
                                onDelete={handleDeleteResource}
                                onSort={handleSort}
                                sortState={sort}
                                getSortIcon={getSortIcon}
                            />
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                {dialogContent()}
            </Dialog>
        </div>
    );
}



