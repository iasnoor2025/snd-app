import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UseResourceFormModalProps {
    projectId: number;
    type: string;
    onSuccess?: () => void;
}

interface UseResourceFormModalReturn {
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    selectedResource: unknown | null;
    isLoading: boolean;
    openCreateModal: () => void;
    openEditModal: (resource: any) => void;
    closeCreateModal: () => void;
    closeEditModal: () => void;
}

export function useResourceFormModal({ projectId, type, onSuccess }: UseResourceFormModalProps): UseResourceFormModalReturn {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<unknown | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const openCreateModal = () => {
        const { t } = useTranslation('project');

        setIsCreateModalOpen(true);
    };

    const openEditModal = (resource: any) => {
        setSelectedResource(resource);
        setIsEditModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setSelectedResource(null);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedResource(null);
    };

    return {
        isCreateModalOpen,
        isEditModalOpen,
        selectedResource,
        isLoading,
        openCreateModal,
        openEditModal,
        closeCreateModal,
        closeEditModal,
    };
}
