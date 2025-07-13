import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import { Textarea } from "@/Core";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Core";
import { Calendar } from "@/Core";
import { Popover, PopoverContent, PopoverTrigger } from "@/Core";
import { format } from 'date-fns';
import { CalendarIcon, User } from 'lucide-react';
import { cn } from "@/Core";
import axios from 'axios';
import { Toggle } from "@/Core";
import { ErrorBoundary } from "@/Core";
import { z } from 'zod';
import { route } from 'ziggy-js';
import { ToastService } from "@/Core";
import { DatePicker } from "@/Core";
import { useTranslation } from 'react-i18next';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
    hourly_rate?: number;
    designation?: string;
}

interface Equipment {
    id: number;
    name: string;
    model: string;
    door_number?: string;
    daily_rate?: number;
}

interface ResourceFormProps {
    type: 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense';
    projectId: number;
    projectEndDate?: string;
    onSuccess?: () => void;
    initialData?: any;
}

interface ResourceFormData {
    project_id: number;
    employee_id?: number | null;
    worker_name?: string | null;
    job_title?: string;
    start_date?: string;
    end_date?: string;
    total_days?: number;
    daily_rate?: number;
    base_daily_rate?: number;
    notes?: string;
    total_cost?: number;
    equipment_id?: number | null;
    hourly_rate?: number;
    usage_hours?: number;
    maintenance_cost?: number;
    name?: string;
    unit?: string;
    date_used?: string;
    quantity?: number;
    unit_price?: number;
    unit_cost?: number;
    type?: string;
    date?: string;
    category?: string;
    description?: string;
    amount?: number;
    material_id?: number | null;
    status?: string;
    [key: string]: any;
}

interface RequestData {
    project_id: number;
    employee_id?: number;
    worker_name?: string;
    job_title: string;
    start_date: string;
    end_date?: string | null;
    daily_rate: number;
    total_days: number;
    total_cost: number;
    notes?: string | null;
    quantity?: number;
    unit_price?: number;
    hourly_rate?: number;
    usage_hours?: number;
    maintenance_cost?: number;
    amount?: number;
    description?: string;
}

const manpowerSchema = z.object({
    employee_id: z.number().nullable().optional(),
    worker_name: z.string().optional(),
    job_title: z.string().min(1, 'Job title is required').max(255, 'Job title cannot exceed 255 characters'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().nullable().optional(),
    daily_rate: z.number().min(0, 'Daily rate must be positive'),
    total_days: z.number().min(0, 'Total days must be positive'),
    notes: z.string().nullable().optional(),
}).refine(data => {
    // If end_date is provided, it must be after or equal to start_date
    if (data.end_date && data.start_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        if (endDate < startDate) return false;
    }
    // Require worker_name if employee_id is not set
    if (!data.employee_id && !(data.worker_name && data.worker_name.length > 0)) {
        return false;
    }
    return true;
}, {
    message: 'Worker name is required if no employee is selected',
    path: ['worker_name'],
});

const materialSchema = z.object({
    material_id: z.number().min(1, 'Material selection is required'),
    name: z.string().min(1, 'Material name is required'),
    unit: z.string().min(1, 'Unit is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unit_price: z.number().min(0, 'Unit price must be positive'),
    total_cost: z.number().min(0, 'Total cost must be positive'),
    date_used: z.string().min(1, 'Date used is required'),
    description: z.string().optional(),
    project_id: z.number().optional(),
    notes: z.string().optional()
});

const equipmentSchema = z.object({
    equipment_id: z.number().min(1, 'Equipment is required'),
    usage_hours: z.number().min(0, 'Usage hours must be positive'),
    hourly_rate: z.number().min(0, 'Hourly rate must be positive'),
    maintenance_cost: z.number().min(0, 'Maintenance cost must be positive').optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional(),
    description: z.string().optional()
});

const fuelSchema = z.object({
    fuel_type: z.string().min(1, 'Fuel type is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unit_price: z.number().min(0, 'Unit price must be positive'),
    total_cost: z.number().min(0, 'Total cost must be positive'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().optional()
});

const expenseSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    total_cost: z.number().min(0, 'Total cost must be positive'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().optional()
});

// Create a wrapped component to handle errors
function ResourceFormContent({ type, projectId, projectEndDate, onSuccess, initialData }: ResourceFormProps): React.ReactElement {
    const { t } = useTranslation(['projects', 'common']);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [useEmployee, setUseEmployee] = useState(initialData?.employee_id ? true : false);
    const formRef = useRef<HTMLFormElement>(null!);
    const mounted = useRef(false);

    // Utility to safely extract a string from a translation object or value
    function safeString(val: any): string {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val !== null) {
            if ('en' in val && typeof val.en === 'string') return val.en;
            const first = Object.values(val)[0];
            if (typeof first === 'string') return first;
            return '';
        }
        return '';
    }

    // Memoize the initial form data
    const initialFormData = useMemo(() => {
        if (!initialData) {
            return {
                project_id: projectId,
                employee_id: '',
                worker_name: '',
                daily_rate: '',
                base_daily_rate: '',
                total_days: '',
                quantity: '',
                unit_price: '',
                unit_cost: '',
                hourly_rate: '',
                usage_hours: '',
                maintenance_cost: '',
                amount: '',
                description: '',
                job_title: '',
                start_date: '',
                end_date: '',
                notes: '',
                equipment_id: '',
                name: '',
                unit: '',
                date_used: '',
                fuel_type: '',
                date: '',
                category: '',
                total_cost: '',
                material_id: '',
                status: 'pending',
            };
        }
        return {
            project_id: projectId,
            employee_id: initialData.employee_id || '',
            worker_name: safeString(initialData.worker_name),
            daily_rate: initialData.daily_rate || '',
            base_daily_rate: initialData.base_daily_rate || '',
            total_days: initialData.total_days || '',
            quantity: initialData.quantity || '',
            unit_price: initialData.unit_price || '',
            unit_cost: initialData.unit_cost || '',
            hourly_rate: initialData.hourly_rate || '',
            usage_hours: initialData.usage_hours || '',
            maintenance_cost: initialData.maintenance_cost || '',
            amount: initialData.amount || '',
            description: safeString(initialData.description),
            job_title: safeString(initialData.job_title),
            start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
            end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
            notes: safeString(initialData.notes),
            equipment_id: initialData.equipment_id || '',
            name: safeString(initialData.name),
            unit: safeString(initialData.unit),
            date_used: initialData.date_used || '',
            fuel_type: safeString(initialData.fuel_type),
            date: initialData.date || '',
            category: safeString(initialData.category),
            total_cost: initialData.total_cost || '',
            material_id: initialData.material_id || '',
            status: initialData.status || 'pending',
        };
    }, [projectId, initialData]);

    const { data, setData, post, put, processing, errors: formErrors, reset } = useForm(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Set mounted flag
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    // Fetch employees/equipment data
    useEffect(() => {
        const fetchData = async () => {
            if (!mounted.current) return;

            setIsLoading(true);
            try {
                if (type === 'manpower') {
                    // Use the authenticated employees endpoint
                    const response = await axios.get('/api/employees/all');
                    if (mounted.current) {
                        setEmployees(response.data);
                    }
                } else if (type === 'equipment' || type === 'fuel') {
                    // Use the authenticated equipment endpoint, match manpower logic
                    const response = await axios.get('/api/v1/equipment');
                    if (mounted.current) {
                        // If response.data is paginated (has .data), use .data, else use response.data directly
                        const equipmentList = Array.isArray(response.data) ? response.data : (response.data.data || []);
                        setEquipment(equipmentList);
                        // If we have initial data, set the hourly rate based on the equipment
                        if (initialData?.equipment_id) {
                            const selectedEquipment = equipmentList.find((e: Equipment) => e.id === initialData.equipment_id);
                            if (selectedEquipment) {
                                const hourlyRate = selectedEquipment.daily_rate ? (selectedEquipment.daily_rate / 8) : 0;
                                setData(prev => ({
                                    ...prev,
                                    hourly_rate: hourlyRate.toString()
                                }));
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // if (mounted.current) {
                //     ToastService.error("Failed to load required data.");
                // }
            } finally {
                if (mounted.current) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
    }, [type, initialData?.equipment_id]);

    // Add calculateTotalDays function
    const calculateTotalDays = useCallback((startDate: string, endDate?: string) => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(); // Use today's date if no end date
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }, []);

    // Add effect to update total days when start date or end date changes
    useEffect(() => {
        if (type === 'manpower' && data.start_date) {
            const days = calculateTotalDays(data.start_date, data.end_date);
            setData(prev => ({
                ...prev,
                total_days: days.toString()
            }));
        }
    }, [data.start_date, data.end_date, type, calculateTotalDays, setData]);

    // Add calculateUsageHours function
    const calculateUsageHours = useCallback((startDate: string, endDate?: string) => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(); // Use today's date if no end date
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Assuming 8 hours per day
        return diffDays * 10;
    }, []);

    // Add effect to update usage hours when start date changes
    useEffect(() => {
        if (type === 'equipment' && data.start_date) {
            const hours = calculateUsageHours(data.start_date, projectEndDate);
            setData(prev => ({
                ...prev,
                usage_hours: hours.toString()
            }));
        }
    }, [data.start_date, projectEndDate, type, calculateUsageHours, setData]);

    // Update handleInputChange to properly handle employee selection
    const handleInputChange = useCallback((field: string, value: any) => {
        setData((prev: any) => {
            const newData = {
                ...prev,
                [field]: value
            };

            // Handle employee_id specifically
            if (field === 'employee_id') {
                if (value) {
                    const employeeId = Number(value);
                    if (!isNaN(employeeId)) {
                        newData.employee_id = employeeId;
                        newData.worker_name = '';
                        const selectedEmployee = employees.find(emp => emp.id === employeeId);
                        if (selectedEmployee) {
                            if (selectedEmployee.designation) {
                                newData.job_title = selectedEmployee.designation;
                            }
                            let calculatedDailyRate = '';
                            if (selectedEmployee.hourly_rate) {
                                calculatedDailyRate = (selectedEmployee.hourly_rate * 10).toFixed(2);
                            }
                            newData.daily_rate = calculatedDailyRate;
                        }
                    } else {
                        newData.employee_id = null;
                    }
                } else {
                    newData.employee_id = null;
                }
            }

            // Handle worker_name specifically
            if (field === 'worker_name') {
                newData.worker_name = String(value).trim();
                newData.employee_id = null;
            }

            return newData;
        })
    }, [employees, setData]);

    // Add effect to ensure status is always valid
    useEffect(() => {
        if (type === 'expense') {
            const validStatuses = ['active', 'inactive', 'pending'];
            if (!data.status || !validStatuses.includes(data.status)) {
                setData(prev => ({
                    ...prev,
                    status: 'pending'
                }));
            }
        }
    }, [type, data.status, setData]);

    // Update handleUseEmployeeChange to properly handle worker_name
    const handleUseEmployeeChange = useCallback((checked: boolean) => {
        setUseEmployee(checked);
        if (checked) {
            // Clear worker name and reset form when switching to employee mode
            setData(prev => ({
                ...prev,
                worker_name: '',
                employee_id: null,
                job_title: '',
                daily_rate: '',
                total_days: '',
                total_cost: '',
                start_date: '',
                end_date: '',
                notes: ''
            }));
        } else {
            // Clear employee_id and reset form when switching to worker name mode
            setData(prev => ({
                ...prev,
                employee_id: null,
                worker_name: '',
                job_title: '',
                daily_rate: '',
                total_days: '',
                total_cost: '',
                start_date: '',
                end_date: '',
                notes: ''
            }));
        }
    }, [setData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Ensure status is set to a valid value and include resource type
            const formData = {
                ...data,
                status: data.status || 'pending',
                resource_type: type  // renamed from 'type' to 'resource_type' to avoid confusion
            };

            // Calculate total_cost for manpower resources
            if (type === 'manpower' && formData.daily_rate && formData.total_days) {
                formData.total_cost = parseFloat(formData.daily_rate) * parseFloat(formData.total_days);
            }

            // Make sure at least employee_id or worker_name is set
            if (type === 'manpower') {
                if (useEmployee && !formData.employee_id) {
                    setErrors({worker_info: 'Please select an employee'})
                    setIsLoading(false);
                    return;
                } else if (!useEmployee && !formData.worker_name) {
                    setErrors({worker_name: 'Please enter a worker name'})
                    setIsLoading(false);
                    return;
                }
            }

            // Use the correct API endpoint for fuel
            if (type === 'fuel') {
                const apiUrl = `/api/projects/${projectId}/fuel`;
                // Ensure required fields are present
                const quantity = data.quantity ? Number(data.quantity) : 0;
                const unit_price = data.unit_price ? Number(data.unit_price) : 0;
                const total_cost = quantity * unit_price;
                const payload = {
                    ...data,
                    type: 'fuel',
                    total_cost,
                    date: data.date_used || '',
                };
                try {
                    const response = await axios.post(apiUrl, payload, {
                        headers: { 'Accept': 'application/json' }
                    });
                    if (response.data && response.data.resource) {
                        if (onSuccess) onSuccess();
                        setIsLoading(false);
                        return;
                    }
                } catch (error: any) {
                    if (error.response && error.response.data && error.response.data.errors) {
                        setErrors(error.response.data.errors);
                    } else {
                        setErrors({ general: 'Failed to save fuel resource.' });
                    }
                    setIsLoading(false);
                    return;
                }
            }

            // Use the router.post/put methods directly with proper error handling for other types
            const routeName = `projects.resources.${type}.${initialData?.id ? 'update' : 'store'}`;
            const routeParams = {
                project: projectId,
                ...(initialData?.id && { [type]: initialData.id })
            };

            console.log('Route name:', routeName);
            console.log('Route params:', routeParams);
            console.log('Form data:', formData);
            console.log('Resource type:', type);
            console.log('Generated URL:', route(routeName, routeParams));

            // Client-side validation before submission
            let validationSchema;
            switch (type) {
                case 'manpower':
                    validationSchema = manpowerSchema;
                    console.log('Using manpower schema - should validate:', manpowerSchema?.shape ? Object.keys(manpowerSchema.shape) : 'Schema not available');
                    break;
                case 'material':
                    validationSchema = materialSchema;
                    console.log('Using material schema - should validate:', materialSchema?.shape ? Object.keys(materialSchema.shape) : 'Schema not available');
                    break;
                case 'equipment':
                    validationSchema = equipmentSchema;
                    console.log('Using equipment schema - should validate:', equipmentSchema?.shape ? Object.keys(equipmentSchema.shape) : 'Schema not available');
                    break;
                case 'fuel':
                    validationSchema = fuelSchema;
                    console.log('Using fuel schema - should validate:', fuelSchema?.shape ? Object.keys(fuelSchema.shape) : 'Schema not available');
                    break;
                case 'expense':
                    validationSchema = expenseSchema;
                    console.log('Using expense schema - should validate:', expenseSchema?.shape ? Object.keys(expenseSchema.shape) : 'Schema not available');
                    break;
                default:
                    console.error('Unknown resource type:', type);
                    setIsLoading(false);
                    return;
            }

            // Prepare data for validation by converting string numbers to actual numbers
            const dataForValidation = { ...formData };

            // --- Ensure all required fields are set for each resource type ---
            if (type === 'material') {
                // Ensure material_id is a number or undefined for validation
                if (dataForValidation.material_id && dataForValidation.material_id !== '') {
                    dataForValidation.material_id = parseInt(dataForValidation.material_id);
                } else {
                    delete dataForValidation.material_id;
                }

                // Map material_id to name for validation
                if (dataForValidation.material_id) {
                    const materialNames = {
                        1: 'Cement',
                        2: 'Steel',
                        3: 'Bricks',
                        4: 'Sand',
                        5: 'Gravel',
                        6: 'Wood',
                        7: 'Paint',
                        8: 'Other'
                    };
                    dataForValidation.name = materialNames[dataForValidation.material_id] || 'Unknown';
                } else {
                    // If no material is selected, we need to fail validation
                    dataForValidation.name = '';
                }

                // Convert numeric fields, keeping them for validation even if empty
                const quantity = dataForValidation.quantity && dataForValidation.quantity !== ''
                    ? parseFloat(dataForValidation.quantity) : 0;
                const unitPrice = dataForValidation.unit_price && dataForValidation.unit_price !== ''
                    ? parseFloat(dataForValidation.unit_price) : 0;

                dataForValidation.quantity = quantity;
                dataForValidation.unit_price = unitPrice;

                // Calculate total_cost automatically
                dataForValidation.total_cost = quantity * unitPrice;

                // Ensure unit and date_used are strings
                dataForValidation.unit = dataForValidation.unit || '';
                dataForValidation.date_used = dataForValidation.date_used || '';
            } else if (type === 'equipment') {
                if (dataForValidation.equipment_id && dataForValidation.equipment_id !== '') {
                    dataForValidation.equipment_id = parseInt(dataForValidation.equipment_id);
                    // Set name to selected equipment's name
                    const selectedEquipment = equipment.find(e => e.id === dataForValidation.equipment_id);
                    dataForValidation.name = (selectedEquipment && typeof selectedEquipment.name === 'string') ? selectedEquipment.name : 'Equipment';
                } else {
                    delete dataForValidation.equipment_id;
                    dataForValidation.name = 'Equipment';
                }
                // Fallback: always set name to 'Equipment' if still missing
                if (!dataForValidation.name) {
                    dataForValidation.name = 'Equipment';
                }
                if (dataForValidation.usage_hours && dataForValidation.usage_hours !== '') {
                    dataForValidation.usage_hours = parseFloat(dataForValidation.usage_hours);
                } else {
                    delete dataForValidation.usage_hours;
                }
                if (dataForValidation.hourly_rate && dataForValidation.hourly_rate !== '') {
                    dataForValidation.hourly_rate = parseFloat(dataForValidation.hourly_rate);
                } else {
                    delete dataForValidation.hourly_rate;
                }
                if (dataForValidation.maintenance_cost && dataForValidation.maintenance_cost !== '') {
                    dataForValidation.maintenance_cost = parseFloat(dataForValidation.maintenance_cost);
                } else {
                    delete dataForValidation.maintenance_cost;
                }
                // Ensure start_date and end_date are always strings (even if empty)
                dataForValidation.start_date = dataForValidation.start_date || '';
                dataForValidation.end_date = dataForValidation.end_date || '';
                // Always set date_used to start_date for equipment
                dataForValidation.date_used = dataForValidation.start_date || '';
            } else if (type === 'fuel') {
                // Ensure total_cost is always set for fuel
                const quantity = dataForValidation.quantity && dataForValidation.quantity !== ''
                    ? parseFloat(dataForValidation.quantity)
                    : 0;
                const unitPrice = dataForValidation.unit_price && dataForValidation.unit_price !== ''
                    ? parseFloat(dataForValidation.unit_price)
                    : 0;
                dataForValidation.total_cost = quantity * unitPrice;
                // Zod expects 'date', form uses 'date_used'
                dataForValidation.date = dataForValidation.date_used || '';
            } else if (type === 'expense') {
                // Ensure amount and total_cost are numbers and always set
                const amount = dataForValidation.amount && dataForValidation.amount !== ''
                    ? parseFloat(dataForValidation.amount)
                    : 0;
                dataForValidation.amount = amount;
                dataForValidation.total_cost = amount;
                // Ensure date is a string (or empty string)
                dataForValidation.date = dataForValidation.date || '';
            } else if (type === 'manpower') {
                if (dataForValidation.employee_id && dataForValidation.employee_id !== '') {
                    dataForValidation.employee_id = parseInt(dataForValidation.employee_id);
                } else {
                    delete dataForValidation.employee_id;
                }
                if (dataForValidation.daily_rate && dataForValidation.daily_rate !== '') {
                    dataForValidation.daily_rate = parseFloat(dataForValidation.daily_rate);
                } else {
                    delete dataForValidation.daily_rate;
                }
                if (dataForValidation.total_days && dataForValidation.total_days !== '') {
                    dataForValidation.total_days = parseInt(dataForValidation.total_days);
                } else {
                    delete dataForValidation.total_days;
                }
            }

            // Log for debugging
            console.log('Final dataForValidation:', dataForValidation);

            // Validate form data before submission
            let finalSubmissionData: { status: any; resource_type: "manpower" | "equipment" | "material" | "fuel" | "expense"; job_title: string; start_date: string; daily_rate: number; total_days: number; employee_id: any; worker_name: any; end_date: string | null; notes: any; project_id: number; base_daily_rate: any; quantity: any; unit_price: any; unit_cost: any; hourly_rate: any; usage_hours: any; maintenance_cost: any; amount: any; description: any; equipment_id: any; name: any; unit: any; date_used: any; fuel_type: any; date: any; category: any; total_cost: any; material_id: any; } | { status: any; resource_type: "manpower" | "equipment" | "material" | "fuel" | "expense"; material_id: number; name: string; unit: string; quantity: number; unit_price: number; total_cost: number; date_used: string; notes: any; description: any; project_id: number; employee_id: any; worker_name: any; daily_rate: any; base_daily_rate: any; total_days: any; unit_cost: any; hourly_rate: any; usage_hours: any; maintenance_cost: any; amount: any; job_title: any; start_date: string; end_date: string; equipment_id: any; fuel_type: any; date: any; category: any; } | { status: any; resource_type: "manpower" | "equipment" | "material" | "fuel" | "expense"; start_date: string; equipment_id: number; hourly_rate: number; usage_hours: number; end_date: string; description: any; maintenance_cost: any; project_id: number; employee_id: any; worker_name: any; daily_rate: any; base_daily_rate: any; total_days: any; quantity: any; unit_price: any; unit_cost: any; amount: any; job_title: any; notes: any; name: any; unit: any; date_used: any; fuel_type: any; date: any; category: any; total_cost: any; material_id: any; } | { status: any; resource_type: "manpower" | "equipment" | "material" | "fuel" | "expense"; quantity: number; unit_price: number; total_cost: number; date: string; fuel_type: string; description: any; project_id: number; employee_id: any; worker_name: any; daily_rate: any; base_daily_rate: any; total_days: any; unit_cost: any; hourly_rate: any; usage_hours: any; maintenance_cost: any; amount: any; job_title: any; start_date: string; end_date: string; notes: any; equipment_id: any; name: any; unit: any; date_used: any; category: any; material_id: any; } | { status: any; resource_type: "manpower" | "equipment" | "material" | "fuel" | "expense"; total_cost: number; date: string; category: string; amount: number; description: any; project_id: number; employee_id: any; worker_name: any; daily_rate: any; base_daily_rate: any; total_days: any; quantity: any; unit_price: any; unit_cost: any; hourly_rate: any; usage_hours: any; maintenance_cost: any; job_title: any; start_date: string; end_date: string; notes: any; equipment_id: any; name: any; unit: any; date_used: any; fuel_type: any; material_id: any; };
            try {
                const validatedData = validationSchema.parse(dataForValidation);
                console.log('Validation passed:', validatedData);
                // Use the validated data for submission instead of original formData
                finalSubmissionData = {
                    ...formData,
                    ...validatedData,
                    status: formData.status || 'pending',
                    resource_type: type
                };
            } catch (validationError) {
                console.error('Client-side validation failed:', validationError);
                if (validationError instanceof z.ZodError) {
                    const fieldErrors: Record<string, string> = {};
                    validationError.errors.forEach(error => {
                        if (error.path.length > 0) {
                            fieldErrors[error.path[0] as string] = error.message;
                        }
                    });
                    setErrors(fieldErrors);
                    setIsLoading(false);
                    return;
                }
            }

            const submitPromise = new Promise((resolve, reject) => {
                if (initialData?.id) {
                    router.put(route(routeName, routeParams), finalSubmissionData, {
                        onSuccess: () => {
                            resolve(true);
                            if (onSuccess) {
                                onSuccess();
                            }
                        },
                        onError: (errors) => {
                            console.error('Update errors:', errors);
                            setErrors(errors);
                            reject(errors);
                        }
                    });
                } else {
                    router.post(route(routeName, routeParams), finalSubmissionData, {
                        onSuccess: () => {
                            resolve(true);
                            if (onSuccess) {
                                onSuccess();
                            }
                        },
                        onError: (errors) => {
                            console.error('Submission errors:', errors);
                            setErrors(errors);
                            reject(errors);
                        }
                    });
                }
            });

            await submitPromise;
        } catch (error) {
            const err = error as any;
            console.error('Form submission errors:', err);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderFormFields = () => {
        switch (type) {
            case 'manpower':
                return (
                    <div className="space-y-6">
                        <div className="bg-muted/40 p-4 rounded-lg">
                            <div className="flex items-center justify-between space-y-0">
                                <div>
                                    <h4 className="font-medium">{t('link_to_employee')}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Do you want to connect this resource to an employee?
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <Toggle
                                        pressed={useEmployee}
                                        onPressedChange={handleUseEmployeeChange}
                                        className="bg-white border border-gray-300 hover:bg-gray-50 data-[state=on]:bg-blue-500 data-[state=on]:text-white min-w-12 h-8"
                                        aria-label={t('lbl_toggle_employee_link')}
                                    />
                                </div>
                            </div>
                        </div>

                        {useEmployee ? (
                            <div className="space-y-2">
                                <Label htmlFor="employee_id">{t('lbl_select_employee')}</Label>
                                <Select
                                    value={data.employee_id?.toString()}
                                    onValueChange={(value) => {
                                        const employeeId = parseInt(value);
                                        if (!isNaN(employeeId)) {
                                            handleInputChange('employee_id', employeeId);
                                        }
                                    }}
                                >
                                    <SelectTrigger className={cn(
                                        "w-full",
                                        errors.employee_id && "border-red-500"
                                    )}>
                                        <SelectValue placeholder={t('ph_select_an_employee')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees && employees.length > 0 ? (
                                            employees.map((employee) => (
                                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                                    {`${employee.first_name} ${employee.last_name}`}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-employee" disabled>{t('opt_no_employees_available')}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.employee_id && (
                                    <p className="text-sm text-red-500">{errors.employee_id}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="worker_name">{t('lbl_worker_name')}</Label>
                                <Input
                                    id="worker_name"
                                    value={data.worker_name}
                                    onChange={(e) => handleInputChange('worker_name', e.target.value)}
                                    placeholder={t('ph_enter_worker_name')}
                                    className={errors.worker_name ? 'border-red-500' : ''}
                                />
                                {errors.worker_name && (
                                    <p className="text-sm text-red-500">{errors.worker_name}</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="job_title">{t('lbl_job_title')}</Label>
                            <Input
                                id="job_title"
                                value={data.job_title}
                                onChange={(e) => handleInputChange('job_title', e.target.value)}
                                placeholder={t('ttl_enter_job_title')}
                                className={errors.job_title ? 'border-red-500' : ''}
                            />
                            {errors.job_title && (
                                <p className="text-sm text-red-500">{errors.job_title}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">{t('lbl_start_date')}</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date || ''}
                                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                                    required
                                    className={errors.start_date ? 'border-red-500' : ''}
                                />
                                {errors.start_date && (
                                    <p className="text-sm text-red-500">{errors.start_date}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">{t('lbl_end_date')}</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date || ''}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                    required
                                    className={errors.end_date ? 'border-red-500' : ''}
                                />
                                {errors.end_date && (
                                    <p className="text-sm text-red-500">{errors.end_date}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="daily_rate">{t('lbl_daily_rate')}</Label>
                            <Input
                                id="daily_rate"
                                type="number"
                                value={data.daily_rate}
                                onChange={(e) => handleInputChange('daily_rate', Number(e.target.value))}
                                placeholder={t('ph_enter_daily_rate')}
                                className={errors.daily_rate ? 'border-red-500' : ''}
                            />
                            {errors.daily_rate && (
                                <p className="text-sm text-red-500">{errors.daily_rate}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="total_days">{t('lbl_total_days')}</Label>
                            <Input
                                id="total_days"
                                type="number"
                                value={data.total_days}
                                readOnly
                                className="bg-muted"
                            />
                            {errors.total_days && (
                                <p className="text-sm text-red-500">{errors.total_days}</p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder={t('ph_enter_any_additional_notes')}
                                className={errors.notes ? 'border-red-500' : ''}
                            />
                            {errors.notes && (
                                <p className="text-sm text-red-500">{errors.notes}</p>
                            )}
                        </div>
                    </div>
                );

            case 'equipment':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">{t('lbl_start_date')}</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date || ''}
                                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                                    required
                                    className={errors.start_date ? 'border-red-500' : ''}
                                />
                                {errors.start_date && (
                                    <p className="text-sm text-red-500">{errors.start_date}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">{t('lbl_end_date')}</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date || ''}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                    required
                                    className={errors.end_date ? 'border-red-500' : ''}
                                />
                                {errors.end_date && (
                                    <p className="text-sm text-red-500">{errors.end_date}</p>
                                )}
                            </div>
                        </div>
                        {/* Equipment selection dropdown */}
                        <div className="space-y-2">
                            <Label htmlFor="equipment_id" className="text-sm font-medium">{t('lbl_select_equipment')}</Label>
                            <Select
                                value={data.equipment_id?.toString() || ''}
                                onValueChange={(value) => {
                                    const selectedEquipment = equipment.find(e => e.id === parseInt(value));
                                    handleInputChange('equipment_id', parseInt(value));
                                    if (selectedEquipment) {
                                        // Set hourly rate from equipment's daily rate (assuming 8-hour workday)
                                        const hourlyRate = selectedEquipment.daily_rate ? (selectedEquipment.daily_rate / 8) : 0;
                                        handleInputChange('hourly_rate', hourlyRate);
                                    }
                                }}
                                disabled={isLoading}
                            >
                                <SelectTrigger className={cn("w-full", errors.equipment_id && "border-red-500")}>
                                    <SelectValue placeholder={t('ph_select_equipment')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Array.isArray(equipment) && equipment.length > 0) ? (
                                        equipment.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {typeof item.name === 'object' && item.name !== null ? (item.name.en || Object.values(item.name)[0] || '') : item.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-equipment" disabled>{t('opt_no_equipment_available')}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.equipment_id && (
                                <p className="text-sm text-red-500">{errors.equipment_id}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="usage_hours">{t('lbl_usage_hours')}</Label>
                            <Input
                                id="usage_hours"
                                type="number"
                                min="1"
                                value={data.usage_hours || ''}
                                onChange={(e) => handleInputChange('usage_hours', Number(e.target.value))}
                                placeholder={t('ph_enter_usage_hours')}
                                className={errors.usage_hours ? 'border-red-500' : ''}
                            />
                            {errors.usage_hours && (
                                <p className="text-sm text-red-500">{errors.usage_hours}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="hourly_rate">{t('lbl_hourly_rate')}</Label>
                                <Input
                                    id="hourly_rate"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.hourly_rate || ''}
                                    onChange={(e) => handleInputChange('hourly_rate', Number(e.target.value))}
                                    placeholder={t('ph_enter_hourly_rate')}
                                    className={errors.hourly_rate ? 'border-red-500' : ''}
                                />
                                {errors.hourly_rate && (
                                    <p className="text-sm text-red-500">{errors.hourly_rate}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total_cost">{t('lbl_total_cost')}</Label>
                                <Input
                                    id="total_cost"
                                    type="number"
                                    value={data.hourly_rate && data.usage_hours ?
                                        (Number(data.hourly_rate) * Number(data.usage_hours)).toFixed(2) : ''}
                                    disabled
                                    className="w-full bg-muted"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notes">{t('lbl_notes_optional')}</Label>
                            <Textarea
                                id="notes"
                                value={data.notes || ''}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder={t('ph_enter_any_additional_notes')}
                                className={errors.notes ? 'border-red-500' : ''}
                            />
                            {errors.notes && (
                                <p className="text-sm text-red-500">{errors.notes}</p>
                            )}
                        </div>
                        {type === 'equipment' && (
                            <input type="hidden" name="date_used" value={data.start_date || ''} />
                        )}
                    </div>
                );

            case 'material':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="material_id">Material</Label>
                                <Select
                                    value={data.material_id?.toString()}
                                    onValueChange={(value) => handleInputChange('material_id', parseInt(value))}
                                >
                                    <SelectTrigger className={`w-full ${errors.material_id ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder={t('ph_select_material')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Cement</SelectItem>
                                        <SelectItem value="2">Steel</SelectItem>
                                        <SelectItem value="3">Bricks</SelectItem>
                                        <SelectItem value="4">Sand</SelectItem>
                                        <SelectItem value="5">Gravel</SelectItem>
                                        <SelectItem value="6">Wood</SelectItem>
                                        <SelectItem value="7">Paint</SelectItem>
                                        <SelectItem value="8">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.material_id && (
                                    <p className="text-sm text-red-500">{errors.material_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Select
                                    value={data.unit || ''}
                                    onValueChange={(value) => handleInputChange('unit', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('ph_select_unit')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pcs">Pieces</SelectItem>
                                        <SelectItem value="kg">Kilograms</SelectItem>
                                        <SelectItem value="m">Meters</SelectItem>
                                        <SelectItem value="m2">{t('opt_square_meters')}</SelectItem>
                                        <SelectItem value="m3">{t('opt_cubic_meters')}</SelectItem>
                                        <SelectItem value="l">Liters</SelectItem>
                                        <SelectItem value="box">Box</SelectItem>
                                        <SelectItem value="set">Set</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.unit && (
                                    <p className="text-sm text-red-500">{errors.unit}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={data.quantity || ''}
                                    onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value))}
                                    placeholder={t('ph_enter_quantity')}
                                    min="0"
                                    step="0.01"
                                    className={errors.quantity ? "border-red-500" : ""}
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-red-500">{errors.quantity}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_price">Unit Price (SAR)</Label>
                                <Input
                                    id="unit_price"
                                    type="number"
                                    value={data.unit_price || ''}
                                    onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value))}
                                    placeholder={t('ph_enter_unit_price')}
                                    min="0"
                                    step="0.01"
                                    className={errors.unit_price ? "border-red-500" : ""}
                                />
                                {errors.unit_price && (
                                    <p className="text-sm text-red-500">{errors.unit_price}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('lbl_date_used')}</label>
                                <DatePicker
                                    date={data.date_used ? new Date(data.date_used) : undefined}
                                    setDate={(date: Date | undefined) => handleInputChange('date_used', date?.toISOString().split('T')[0])}
                                    placeholder={t('ph_select_date_used')}
                                />
                                {errors.date_used && (
                                    <p className="text-sm text-red-500">{errors.date_used}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes || ''}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    placeholder={t('ph_add_any_additional_notes')}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="total_cost">Total Cost (SAR)</Label>
                            <Input
                                id="total_cost"
                                type="number"
                                value={data.quantity && data.unit_price ? (Number(data.quantity) * Number(data.unit_price)).toFixed(2) : ''}
                                disabled
                                className="w-full bg-muted"
                            />
                        </div>
                    </div>
                );

            case 'fuel':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="equipment_id" className="text-sm font-medium">Equipment</Label>
                                <Select
                                    value={data.equipment_id?.toString()}
                                    onValueChange={(value) => handleInputChange('equipment_id', parseInt(value))}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('ph_select_equipment')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {equipment && equipment.length > 0 ? (
                                            equipment.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {safeString(item.name)}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-equipment" disabled>{t('opt_no_equipment_available')}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.equipment_id && (
                                    <p className="text-sm text-red-500">{errors.equipment_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fuel_type">{t('lbl_fuel_type')}</Label>
                                <Select
                                    value={data.fuel_type || ''}
                                    onValueChange={(value) => handleInputChange('fuel_type', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('ph_select_fuel_type')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="diesel">Diesel</SelectItem>
                                        <SelectItem value="petrol">Petrol</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.fuel_type && (
                                    <p className="text-sm text-red-500">{errors.fuel_type}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity (Liters)</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={data.quantity || ''}
                                    onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value))}
                                    placeholder={t('ph_enter_quantity')}
                                    min="0"
                                    step="0.01"
                                    className={errors.quantity ? "border-red-500" : ""}
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-red-500">{errors.quantity}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_price">Unit Price (SAR/Liter)</Label>
                                <Input
                                    id="unit_price"
                                    type="number"
                                    value={data.unit_price || ''}
                                    onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value))}
                                    placeholder={t('ph_enter_unit_price')}
                                    min="0"
                                    step="0.01"
                                    className={errors.unit_price ? "border-red-500" : ""}
                                />
                                {errors.unit_price && (
                                    <p className="text-sm text-red-500">{errors.unit_price}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('lbl_date_used')}</label>
                                <DatePicker
                                    date={data.date_used ? new Date(data.date_used) : undefined}
                                    setDate={(date: Date | undefined) => handleInputChange('date_used', date?.toISOString().split('T')[0])}
                                    placeholder={t('ph_select_date_used')}
                                />
                                {errors.date_used && (
                                    <p className="text-sm text-red-500">{errors.date_used}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes || ''}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    placeholder={t('ph_add_any_additional_notes')}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="total_cost" className="text-sm font-medium">Total Cost (SAR)</Label>
                            <Input
                                id="total_cost"
                                type="number"
                                value={data.quantity && data.unit_price ? (Number(data.quantity) * Number(data.unit_price)).toFixed(2) : ''}
                                disabled
                                className="w-full bg-muted"
                            />
                        </div>
                    </div>
                );

            case 'expense':
                return (
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="bg-muted/40 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold">{t('add_new_expense')}</h3>
                            <p className="text-sm text-muted-foreground">
                                Fill in the details below to add a new expense to the project.
                            </p>
                        </div>

                        {/* Main Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Category and Amount */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                                        <Select
                                            value={data.category || ''}
                                            onValueChange={(value) => handleInputChange('category', value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t('ph_select_category')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="accommodation">Accommodation</SelectItem>
                                                <SelectItem value="transportation">Transportation</SelectItem>
                                                <SelectItem value="meals">Meals</SelectItem>
                                                <SelectItem value="utilities">Utilities</SelectItem>
                                                <SelectItem value="office_supplies">{t('opt_office_supplies')}</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="text-sm text-red-500">{errors.category}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-sm font-medium">Amount (SAR)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">SAR</span>
                                            <Input
                                                id="amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.total_cost || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleInputChange('total_cost', value);
                                                    handleInputChange('amount', value);
                                                }}
                                                placeholder="0.00"
                                                className="pl-12"
                                                required
                                            />
                                        </div>
                                        {errors.amount && (
                                            <p className="text-sm text-red-500">{errors.amount}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Date and Status */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                                        <DatePicker
                                            date={data.date ? new Date(data.date) : undefined}
                                            setDate={(date: Date | undefined) => handleInputChange('date', date?.toISOString().split('T')[0])}
                                            placeholder={t('ph_select_date')}
                                        />
                                        {errors.date && (
                                            <p className="text-sm text-red-500">{errors.date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                                        <Select
                                            value={data.status || 'pending'}
                                            onValueChange={(value) => handleInputChange('status', value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t('ph_select_status')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-500">{errors.status}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description || ''}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder={t('ph_enter_a_detailed_description_of_the_expense')}
                                        className="min-h-[120px]"
                                        required
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-medium">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes || ''}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder={t('ph_add_any_additional_notes_or_comments')}
                                        className="min-h-[100px]"
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-500">{errors.notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="bg-muted/40 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Category</p>
                                    <p className="font-medium">{data.category || 'Not selected'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-medium">SAR {data.total_cost || '0.00'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-medium capitalize">{data.status || 'Pending'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} data-resource-type={type} className="space-y-8">
            {renderFormFields()}
            <div className="flex justify-end space-x-2">
                <Button
                    type="submit"
                    disabled={processing || isLoading}
                    className="min-w-[100px]"
                >
                    {isLoading ? t('common:saving') : initialData?.id ? t('common:update') : t('common:save')}
                </Button>
            </div>
        </form>
    );
}

// Export a wrapped version of the component with error boundary
export default function ResourceForm(props: ResourceFormProps) {
    return (
        <ErrorBoundary>
            <ResourceFormContent {...props} />
        </ErrorBoundary>
    );
}















