import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/Core";
import ResourceForm from './ResourceForm';
import { toast } from "@/Core";

// Define a type for resource types
export type ResourceType = 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense';

// Props interface
interface ResourceDialogManagerProps {
    projectId: number;
    resourceType: ResourceType;
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

/**
 * A component that manages resource dialogs based on the selected type
 */
export default function ResourceDialogManager({
    projectId,
    resourceType,
    isOpen,
    onClose,
    initialData = null
}: ResourceDialogManagerProps) {
  const { t } = useTranslation('project');

    // Internal state to track the actual dialog type
    const [currentType, setCurrentType] = useState<ResourceType>(resourceType);
    const [instanceId] = useState(Date.now()); // Unique ID for this dialog instance

    // Update current type when resourceType changes
    useEffect(() => {
        console.log(`ResourceDialogManager: Type changed from ${currentType} to ${resourceType}`);
        setCurrentType(resourceType);
    }, [resourceType]);

    // Handle successful form submission
    const handleSuccess = () => {
        onClose();
        toast({
            title: `Resource ${initialData ? 'updated' : 'added'}`,
            description: `The ${currentType} resource has been successfully ${initialData ? 'updated' : 'added'}.`,
            variant: "default",
        })
        // Refresh the page
        window.location.reload();
    };

    // Get the title based on the current type
    const getTitle = () => {
        const action = initialData ? 'Edit' : 'Add';
        switch (currentType) {
            case 'manpower': return `${action} Manpower`;
            case 'equipment': return `${action} Equipment`;
            case 'material': return `${action} Material`;
            case 'fuel': return `${action} Fuel`;
            case 'expense': return `${action} Expense`;
            default: return `${action} Resource`;
        }
    };

    // Get the description based on the current type
    const getDescription = () => {
        const action = initialData ? 'Update the details for this' : 'Add a new';
        return `${action} ${currentType} resource.`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogDescription>{getDescription()}</DialogDescription>
                </DialogHeader>
                <div className="p-1 bg-gray-50 rounded mb-2 text-xs font-mono">
                    DialogManager: Type={currentType} | Instance={instanceId} | Project={projectId}
                </div>
                <ResourceForm
                    key={`${currentType}-form-${instanceId}-${initialData?.id || 'new'}`}
                    type={currentType}
                    projectId={projectId}
                    initialData={initialData}
                    onSuccess={handleSuccess}
                />
            </DialogContent>
        </Dialog>
    );
}














