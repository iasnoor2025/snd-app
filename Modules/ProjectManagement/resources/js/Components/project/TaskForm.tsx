import React, { useEffect, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { ProjectTask } from './TaskList';

const formSchema = z.object({
    title: z.string().min(3, {
        message: 'Title must be at least 3 characters.',
    }),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
    priority: z.enum(['low', 'medium', 'high']),
    due_date: z.date().optional().nullable(),
    completion_percentage: z.coerce.number().min(0).max(100),
    assigned_to_id: z.string(),
})

interface TaskFormProps {
    projectId: number;
    initialData?: ProjectTask | null;
    assignableUsers?: Array<{ id: number; name: string }>
    onSuccess: () => void;
}

// Wrap the component in memo to prevent unnecessary re-renders
const TaskForm = memo(function TaskForm({ projectId, initialData = null, assignableUsers = [], onSuccess }: TaskFormProps) {
  const { t } = useTranslation('project');

    // Use a ref to track submission state and prevent multiple state updates
    const isSubmitting = useRef(false);
    const mounted = useRef(true);

    // Clean up on unmount
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            status: initialData?.status || 'pending',
            priority: initialData?.priority || 'medium',
            due_date: initialData?.due_date ? new Date(initialData.due_date) : null,
            completion_percentage: initialData?.completion_percentage || 0,
            assigned_to_id: initialData?.assigned_to?.id?.toString() || 'none',
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                title: initialData.title,
                description: initialData.description || '',
                status: initialData.status,
                priority: initialData.priority,
                due_date: initialData.due_date ? new Date(initialData.due_date) : null,
                completion_percentage: initialData.completion_percentage,
                assigned_to_id: initialData.assigned_to?.id?.toString() || 'none',
            })
        }
    }, [initialData, form]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Prevent multiple submissions
        if (isSubmitting.current) return;

        isSubmitting.current = true;
        console.log('TaskForm: Submitting values:', values);

        const formattedValues = {
            ...values,
            due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
            project_id: projectId,
            assigned_to_id: values.assigned_to_id === 'none' ? null : parseInt(values.assigned_to_id),
        };

        console.log('TaskForm: Formatted values to send:', formattedValues);
        console.log('TaskForm: Project ID:', projectId);
        console.log('TaskForm: Route URL for tasks.store:', route('projects.tasks.store', { project: projectId }));

        // If we have initialData, we're editing an existing task
        if (initialData) {
            console.log('TaskForm: Updating existing task with ID:', initialData.id);
            router.put(route('projects.tasks.update', { project: projectId, task: initialData.id }), formattedValues, {
                onSuccess: () => {
                    console.log('TaskForm: Task update successful');
                    onSuccess();
                    isSubmitting.current = false;
                },
                onError: (errors) => {
                    console.error('TaskForm: Task update failed with errors:', errors);
                    isSubmitting.current = false;
                }
            })
        } else {
            console.log('TaskForm: Creating new task');
            router.post(route('projects.tasks.store', { project: projectId }), formattedValues, {
                onSuccess: (page) => {
                    console.log('TaskForm: Task creation successful', page);
                    onSuccess();
                    isSubmitting.current = false;
                },
                onError: (errors) => {
                    console.error('TaskForm: Task creation failed with errors:', errors);
                    isSubmitting.current = false;

                    // Display error messages to the user
                    if (errors) {
                        Object.keys(errors).forEach(key => {
                            form.setError(key as any, {
                                type: "server",
                                message: Array.isArray(errors[key]) ? errors[key][0] : errors[key]
                            })
                        })
                    }
                }
            })
        }
    };

    return (
        <Form data-resource-type="task" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Task title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t('ph_task_description')}
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_status')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">{t('in_progress')}</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_priority')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }: { field: any }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{t('lbl_due_date')}</FormLabel>
                            <FormControl>
                                <DatePicker
                                    date={field.value || undefined}
                                    setDate={field.onChange}
                                    placeholder={t('ph_select_due_date')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                    <FormField
                        control={form.control}
                        name="completion_percentage"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>{t('lbl_completion_percentage')}</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" max="100" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {assignableUsers.length > 0 && (
                    <FormField
                        control={form.control}
                        name="assigned_to_id"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>{t('lbl_assigned_to')}</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('ph_select_person')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">{t('opt_not_assigned')}</SelectItem>
                                        {assignableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="flex justify-end">
                    <Button type="submit">
                        {initialData ? 'Save Changes' : 'Create Task'}
                    </Button>
                </div>
        </Form>
    );
})

export default TaskForm;
















