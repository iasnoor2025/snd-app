import { Badge, Button } from '@/Core';
import { useTranslation } from 'react-i18next';
import { ResourceFormModal } from '@/ProjectManagement/Components/project/resources/ResourceModal';
import { ResourceTable } from '@/ProjectManagement/Components/project/resources/ResourceTable';
import { useResourceFormModal } from '../../../hooks/useResourceFormModal';
import { useResourceSubmit } from '../../../hooks/useResourceSubmit';
import { formatCurrency } from '../../../lib/utils';
import type { EquipmentResource } from '../../../types/projectResources';

interface EquipmentTabProps {
    project: {
        id: number;
    };
    equipments: { data: EquipmentResource[] };
    availableEquipment: EquipmentResource[];
}

export function EquipmentTab({ project, equipments, availableEquipment }: EquipmentTabProps) {
    const { t } = useTranslation('project');

    const { isCreateModalOpen, isEditModalOpen, selectedResource, isLoading, openCreateModal, openEditModal, closeCreateModal, closeEditModal } =
        useResourceFormModal({
            projectId: project.id,
            type: 'equipment',
            onSuccess: () => {
                // Refresh the list of equipment
                window.location.reload();
            },
        });

    const { isSubmitting, handleSubmit, handleUpdate, handleDelete } = useResourceSubmit({
        projectId: project.id,
        type: 'equipment',
        onSuccess: () => {
            closeCreateModal();
            closeEditModal();
            window.location.reload();
        },
    });

    const handleDeleteClick = (equipment: EquipmentResource) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            handleDelete(equipment.id);
        }
    };

    const columns = [
        {
            accessorKey: 'equipment_name',
            header: 'Equipment Name',
            cell: ({ row }: any) => (
                <span>
                    {row.original.equipment_name}
                    {row.original.is_orphaned_equipment && (
                        <Badge variant="destructive" className="ml-2">
                            Orphaned
                        </Badge>
                    )}
                </span>
            ),
        },
        { accessorKey: 'model', header: 'Model' },
        { accessorKey: 'door_number', header: 'Door Number' },
        { accessorKey: 'start_date', header: 'Start Date' },
        { accessorKey: 'end_date', header: 'End Date' },
        {
            accessorKey: 'base_daily_rate',
            header: 'Base Daily Rate',
            cell: ({ row }: any) => formatCurrency(row.original.base_daily_rate),
        },
        {
            accessorKey: 'daily_rate',
            header: 'Daily Rate',
            cell: ({ row }: any) => formatCurrency(row.original.daily_rate),
        },
        { accessorKey: 'total_days', header: 'Total Days' },
        {
            accessorKey: 'maintenance_cost',
            header: 'Maintenance Cost',
            cell: ({ row }: any) => formatCurrency(row.original.maintenance_cost),
        },
        {
            accessorKey: 'total_cost',
            header: 'Total Cost',
            cell: ({ row }: any) => formatCurrency(row.original.total_cost),
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
                data={equipments.data}
                columns={columns}
                onEdit={(resource) => {
                    openEditModal(resource);
                }}
                onDelete={handleDeleteClick}
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
