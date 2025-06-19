/**
 * ManpowerTab Component
 *
 * This component manages the display and CRUD operations for manpower resources.
 * It uses shared components and utilities for consistent UI and functionality.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Modules/Core/resources/js/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { ResourceFormModal } from '../../../components/project/resources/ResourceModal';
import { useResourceFormModal } from '../../../hooks/useResourceFormModal';
import { useResourceSubmit } from '../../../hooks/useResourceSubmit';
import type { ManpowerResource } from '../../../types/projectResources';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';

/**
 * Props interface for ManpowerTab component
 *
 * @property project - Project information
 * @property manpowers - Array of manpower resources
 */
interface ManpowerTabProps {
    project: {
        id: string;
    };
    manpowers: ManpowerResource[];
}

/**
 * ManpowerTab Component
 *
 * This component provides a tab interface for managing manpower resources.
 * It includes:
 * - A table displaying all manpower resources
 * - Create, edit, and delete functionality using modals
 * - Form validation using Zod schemas
 * - Consistent UI using shared components
 *
 * @param project - Project information
 * @param manpowers - Array of manpower resources
 * @returns JSX element containing the manpower management interface
 */
export function ManpowerTab({ project, manpowers }: ManpowerTabProps) {
  const { t } = useTranslation('project');

    const {
        isCreateModalOpen,
        isEditModalOpen,
        selectedResource,
        isLoading,
        openCreateModal,
        openEditModal,
        closeCreateModal,
        closeEditModal,
    } = useResourceFormModal({
        projectId: Number(project.id),
        type: 'manpower',
        onSuccess: () => {
            // Refresh the data using Inertia
            router.reload({ only: ['manpowers'] });
        }
    });

    const { isSubmitting, handleSubmit, handleUpdate, handleDelete } = useResourceSubmit({
        projectId: Number(project.id),
        type: 'manpower',
        onSuccess: () => {
            closeCreateModal();
            closeEditModal();
            // Refresh the data using Inertia
            router.reload({ only: ['manpowers'] });
        }
    });

    const handleDeleteClick = (manpower: ManpowerResource) => {
        if (window.confirm('Are you sure you want to delete this manpower resource?')) {
            handleDelete(manpower.id);
        }
    };

    const calculateTotalCost = (manpower: ManpowerResource) => {
        const dailyRate = manpower.daily_rate || 0;
        const totalDays = manpower.total_days || 0;
        return dailyRate * totalDays;
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'yyyy-MM-dd');
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const handleCreateSuccess = () => {
        // Refresh the data using Inertia
        router.reload({ only: ['manpowers'] });
    };

    const handleUpdateSuccess = () => {
        // Refresh the data using Inertia
        router.reload({ only: ['manpowers'] });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreateModal}>{t('ttl_add_manpower')}</Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>{t('lbl_start_date')}</TableHead>
                            <TableHead>{t('end_date')}</TableHead>
                            <TableHead>{t('lbl_daily_rate')}</TableHead>
                            <TableHead>{t('lbl_total_days')}</TableHead>
                            <TableHead>{t('th_total_cost')}</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {manpowers.map((manpower) => (
                            <TableRow key={manpower.id}>
                                <TableCell>{manpower.worker_name}</TableCell>
                                <TableCell>{manpower.job_title}</TableCell>
                                <TableCell>{formatDate(manpower.start_date)}</TableCell>
                                <TableCell>{formatDate(manpower.end_date)}</TableCell>
                                <TableCell>{manpower.daily_rate}</TableCell>
                                <TableCell>{manpower.total_days}</TableCell>
                                <TableCell>{calculateTotalCost(manpower)}</TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(manpower)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(manpower)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <ResourceFormModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                title={t('ttl_add_manpower')}
                type="manpower"
                projectId={Number(project.id)}
                onSuccess={handleCreateSuccess}
            />

            <ResourceFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title={t('ttl_edit_manpower')}
                type="manpower"
                projectId={Number(project.id)}
                initialData={selectedResource}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
}
export default ManpowerTab;















