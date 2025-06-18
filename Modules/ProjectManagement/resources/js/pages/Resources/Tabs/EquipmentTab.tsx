import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ResourceFormModal } from '../../../components/project/resources/ResourceModal';
import { ResourceTable } from '../../../components/project/resources/ResourceTable';
import { useResourceFormModal } from '../../../hooks/useResourceFormModal';
import { useResourceSubmit } from '../../../hooks/useResourceSubmit';
import type { EquipmentResource } from '../../../types/projectResources';
import { formatCurrency } from '../../../lib/utils';

interface EquipmentTabProps {
    project: {
        id: number;
    };
    equipments: EquipmentResource[];
    availableEquipment: EquipmentResource[];
}

export function EquipmentTab({ project, equipments, availableEquipment }: EquipmentTabProps) {
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
        projectId: project.id,
        type: 'equipment',
        onSuccess: () => {
            // Refresh the list of equipment
            window.location.reload();
        }
    });

    const { isSubmitting, handleSubmit, handleUpdate, handleDelete } = useResourceSubmit({
        projectId: project.id,
        type: 'equipment',
        onSuccess: () => {
            closeCreateModal();
            closeEditModal();
            window.location.reload();
        }
    });

    const handleDeleteClick = (equipment: EquipmentResource) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            handleDelete(equipment.id);
        }
    };

    const columns = [
        { key: 'name' as keyof EquipmentResource, header: 'Equipment Name' },
        { key: 'model' as keyof EquipmentResource, header: 'Model' },
        { key: 'door_number' as keyof EquipmentResource, header: 'Door Number' },
        { key: 'start_date' as keyof EquipmentResource, header: 'Start Date' },
        { key: 'end_date' as keyof EquipmentResource, header: 'End Date' },
        {
            key: 'base_daily_rate' as keyof EquipmentResource,
            header: 'Base Daily Rate',
            render: (value: number) => formatCurrency(value),
        },
        {
            key: 'daily_rate' as keyof EquipmentResource,
            header: 'Daily Rate',
            render: (value: number) => formatCurrency(value),
        },
        { key: 'total_days' as keyof EquipmentResource, header: 'Total Days' },
        {
            key: 'maintenance_cost' as keyof EquipmentResource,
            header: 'Maintenance Cost',
            render: (value: number) => formatCurrency(value),
        },
        {
            key: 'total_cost' as keyof EquipmentResource,
            header: 'Total Cost',
            render: (_: unknown, resource: EquipmentResource) => {
                const dailyRate = resource.daily_rate || 0;
                const totalDays = resource.total_days || 0;
                const maintenanceCost = resource.maintenance_cost || 0;
                return formatCurrency((dailyRate * totalDays) + maintenanceCost);
            },
        },
    ];

    const handleCreateSuccess = () => {
        // The form data is handled by the ResourceForm component
        window.location.reload();
    };

    const handleUpdateSuccess = () => {
        // The form data is handled by the ResourceForm component
        window.location.reload();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreateModal}>{t('ttl_add_equipment')}</Button>
            </div>

            <ResourceTable
                resources={equipments}
                columns={columns}
                onEdit={(resource) => {
                    openEditModal(resource);
                }}
                onDelete={handleDeleteClick}
                type="equipment"
            />

            <ResourceFormModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                title={t('ttl_add_equipment')}
                type="equipment"
                projectId={project.id}
                onSuccess={handleCreateSuccess}
            />

            <ResourceFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title={t('ttl_edit_equipment')}
                type="equipment"
                projectId={project.id}
                initialData={selectedResource}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
}

export default EquipmentTab;

