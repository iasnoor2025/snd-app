/**
 * ManpowerTab Component
 *
 * This component manages the display and CRUD operations for manpower resources.
 * It uses shared components and utilities for consistent UI and functionality.
 */

import { Button } from '@/Core';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ResourceFormModal } from '@/ProjectManagement/components/project/resources/ResourceModal';
import { ResourceTable } from '@/ProjectManagement/components/project/resources/ResourceTable';
import { useResourceFormModal } from '../../../hooks/useResourceFormModal';
import { useResourceSubmit } from '../../../hooks/useResourceSubmit';
import type { ManpowerResource } from '../../../types/projectResources';

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

    const { isCreateModalOpen, isEditModalOpen, selectedResource, isLoading, openCreateModal, openEditModal, closeCreateModal, closeEditModal } =
        useResourceFormModal({
            projectId: Number(project.id),
            type: 'manpower',
            onSuccess: () => {
                router.reload({ only: ['manpowers'] });
            },
        });

    const { isSubmitting, handleSubmit, handleUpdate, handleDelete } = useResourceSubmit({
        projectId: Number(project.id),
        type: 'manpower',
        onSuccess: () => {
            closeCreateModal();
            closeEditModal();
            router.reload({ only: ['manpowers'] });
        },
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
            return dateString;
        }
    };

    const columns = [
        {
            key: 'worker_name',
            header: 'Worker',
            accessor: (row: ManpowerResource) => {
                const name = row.worker_name;
                if (!name) return '';
                if (typeof name === 'string') return name;
                if (typeof name === 'object' && name.en) return name.en;
                if (typeof name === 'object') return Object.values(name)[0];
                return '';
            },
            className: 'text-center',
        },
        {
            key: 'job_title',
            header: 'Job Title',
            accessor: (row: ManpowerResource) => row.job_title,
            className: 'text-center',
        },
        {
            key: 'start_date',
            header: t('lbl_start_date'),
            accessor: (row: ManpowerResource) => formatDate(row.start_date),
            className: 'text-center',
        },
        {
            key: 'end_date',
            header: t('end_date'),
            accessor: (row: ManpowerResource) => formatDate(row.end_date),
            className: 'text-center',
        },
        {
            key: 'daily_rate',
            header: t('lbl_daily_rate'),
            accessor: (row: ManpowerResource) => row.daily_rate,
            className: '!text-right',
        },
        {
            key: 'total_days',
            header: t('lbl_total_days'),
            accessor: (row: ManpowerResource) => row.total_days,
            className: '!text-right',
        },
        {
            key: 'total_cost',
            header: t('th_total_cost'),
            accessor: (row: ManpowerResource) => calculateTotalCost(row),
            className: '!text-right',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreateModal}>{t('ttl_add_manpower')}</Button>
            </div>
            <ResourceTable data={manpowers} columns={columns} onEdit={openEditModal} onDelete={handleDeleteClick} isLoading={isLoading} />
            <ResourceFormModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                title={t('ttl_add_manpower')}
                type="manpower"
                projectId={Number(project.id)}
                onSuccess={() => router.reload({ only: ['manpowers'] })}
            />
            <ResourceFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title={t('ttl_edit_manpower')}
                type="manpower"
                projectId={Number(project.id)}
                initialData={selectedResource}
                onSuccess={() => router.reload({ only: ['manpowers'] })}
            />
        </div>
    );
}
export default ManpowerTab;
