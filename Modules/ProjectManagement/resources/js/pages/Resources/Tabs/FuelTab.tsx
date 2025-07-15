import { Button } from '@/Core';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { useTranslation } from 'react-i18next';
import { ResourceFormModal } from '../../../components/project/resources/ResourceModal';
import { ResourceTable } from '../../../Components/project/resources/ResourceTable';
import { useResourceFormModal } from '../../../hooks/useResourceFormModal';
import { useResourceSubmit } from '../../../hooks/useResourceSubmit';
import { formatCurrency } from '../../../lib/utils';

interface FuelTabProps {
    project: {
        id: string;
        name: string;
    };
    fuel: Array<{
        id: string;
        equipment_id: string;
        equipment: {
            id: string;
            name: string;
        };
        fuel_type: string;
        quantity: number;
        unit_price: number;
        date: string;
        notes?: string;
    }>;
    projectEquipment: Array<{
        id: string;
        name: string;
    }>;
}

export function FuelTab({ project, fuel, projectEquipment }: FuelTabProps) {
    const { t } = useTranslation('project');

    const { isCreateModalOpen, isEditModalOpen, selectedResource, isLoading, openCreateModal, openEditModal, closeCreateModal, closeEditModal } =
        useResourceFormModal({
            projectId: Number(project.id),
            type: 'fuel',
            onSuccess: () => {
                window.location.reload();
            },
        });

    const { isSubmitting, handleSubmit, handleUpdate, handleDelete } = useResourceSubmit({
        projectId: Number(project.id),
        type: 'fuel',
        onSuccess: () => {
            closeCreateModal();
            closeEditModal();
            window.location.reload();
        },
    });

    const handleDeleteClick = (fuelItem: any) => {
        if (window.confirm('Are you sure you want to delete this fuel record?')) {
            handleDelete(fuelItem.id);
        }
    };

    const columns = [
        {
            key: 'equipment',
            header: 'Equipment',
            accessor: (row: any) => {
                const name = row.equipment?.name;
                if (!name) return '';
                if (typeof name === 'string') return name;
                if (typeof name === 'object' && name.en) return name.en;
                if (typeof name === 'object') return Object.values(name)[0];
                return '';
            },
            className: 'text-center',
        },
        {
            key: 'fuel_type',
            header: t('lbl_fuel_type'),
            accessor: (row: any) => row.fuel_type,
            className: 'text-left',
        },
        {
            key: 'quantity',
            header: 'Quantity',
            accessor: (row: any) => row.quantity,
            className: 'text-right',
        },
        {
            key: 'unit_price',
            header: t('lbl_unit_price'),
            accessor: (row: any) => formatCurrency(row.unit_price),
            className: 'text-right',
        },
        {
            key: 'total_cost',
            header: t('th_total_cost'),
            accessor: (row: any) => formatCurrency(row.quantity * row.unit_price),
            className: 'text-right',
        },
        {
            key: 'date',
            header: 'Date',
            accessor: (row: any) => formatDateMedium(row.date),
            className: 'text-center',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreateModal}>{t('ttl_add_fuel')}</Button>
            </div>
            <ResourceTable data={fuel} columns={columns} onEdit={openEditModal} onDelete={handleDeleteClick} isLoading={isLoading} />
            <ResourceFormModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                title={t('ttl_add_fuel')}
                type="fuel"
                projectId={Number(project.id)}
                onSuccess={window.location.reload}
            />
            <ResourceFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title={t('ttl_edit_fuel')}
                type="fuel"
                projectId={Number(project.id)}
                initialData={selectedResource}
                onSuccess={window.location.reload}
            />
        </div>
    );
}

export default FuelTab;
