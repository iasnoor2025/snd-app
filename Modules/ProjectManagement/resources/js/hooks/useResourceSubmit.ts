import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { toast } from "@/Core";

interface UseResourceSubmitProps {
    projectId: number;
    type: string;
    onSuccess?: () => void;
}

interface UseResourceSubmitReturn {
    isSubmitting: boolean;
    handleSubmit: (data: any) => void;
    handleUpdate: (id: number, data: any) => void;
    handleDelete: (id: number) => void;
}

export function useResourceSubmit({
    projectId,
    type,
    onSuccess
}: UseResourceSubmitProps): UseResourceSubmitReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (data: any) => {
  const { t } = useTranslation('project');

        setIsSubmitting(true);

        router.post(`/projects/${projectId}/resources/${type}`, data, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Success",
                    description: `${type.charAt(0).toUpperCase() + type.slice(1)} resource created successfully`,
                    variant: "default",
                });
                onSuccess?.();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error('Submission errors:', errors);
                toast({
                    title: "Error",
                    description: `Failed to create ${type} resource. Please check your input and try again.`,
                    variant: "destructive",
                });
            }
        });
    };

    const handleUpdate = (id: number, data: any) => {
        setIsSubmitting(true);

        router.put(`/projects/${projectId}/resources/${type}/${id}`, data, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Success",
                    description: `${type.charAt(0).toUpperCase() + type.slice(1)} resource updated successfully`,
                    variant: "default",
                });
                onSuccess?.();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error('Update errors:', errors);
                toast({
                    title: "Error",
                    description: `Failed to update ${type} resource. Please check your input and try again.`,
                    variant: "destructive",
                });
            }
        });
    };

    const handleDelete = (id: number) => {
        setIsSubmitting(true);

        if (type === 'manpower') {
            const url = route('projects.resources.manpower.destroy', {
                project: projectId,
                manpower: id
            });
            fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                },
                credentials: 'same-origin',
            })
                .then(() => {
                    setIsSubmitting(false);
                    toast({
                        title: "Success",
                        description: `Manpower resource deleted successfully`,
                        variant: "default",
                    });
                    onSuccess?.();
                })
                .catch((error) => {
                    setIsSubmitting(false);
                    console.error('Delete errors:', error);
                    toast({
                        title: "Error", 
                        description: `Failed to delete manpower resource. Please try again.`,
                        variant: "destructive",
                    });
                });
            return;
        }

        router.delete(`/projects/${projectId}/resources/${type}/${id}`, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Success",
                    description: `${type.charAt(0).toUpperCase() + type.slice(1)} resource deleted successfully`,
                    variant: "default",
                });
                onSuccess?.();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error('Delete errors:', errors);
                toast({
                    title: "Error",
                    description: `Failed to delete ${type} resource. Please try again.`,
                    variant: "destructive",
                });
            }
        });
    };

    return {
        isSubmitting,
        handleSubmit,
        handleUpdate,
        handleDelete,
    };
}

