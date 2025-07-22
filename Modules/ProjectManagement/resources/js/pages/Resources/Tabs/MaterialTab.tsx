import { Button } from '@/Core';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { useTranslation } from 'react-i18next';
import { ResourceFormModal } from '@/ProjectManagement/components/project/resources/ResourceModal';
import { ResourceTable } from '@/ProjectManagement/components/project/resources/ResourceTable';
import { useResourceFormModal } from '../../../hooks/useResourceFormModal';
import { useResourceSubmit } from '../../../hooks/useResourceSubmit';
import { formatCurrency } from '../../../lib/utils';

interface MaterialTabProps {
    project: {
        id: string;
        name: string;
    };
    projectMaterials: any[];
}

export function MaterialTab({ project, projectMaterials }: MaterialTabProps) {
    const { t } = useTranslation('project');

    const { isCreateModalOpen, isEditModalOpen, selectedResource, isLoading, openCreateModal, openEditModal, closeCreateModal, closeEditModal } =
        useResourceFormModal({
            projectId: Number(project.id),
            type: 'material',
            onSuccess: () => {
                window.location.reload();
            },
        });

    const { isSubmitting, handleSubmit, handleUpdate, handleDelete } = useResourceSubmit({
        projectId: Number(project.id),
        type: 'material',
        onSuccess: () => {
            closeCreateModal();
            closeEditModal();
            window.location.reload();
        },
    });

    const handleDeleteClick = (material: any) => {
        if (window.confirm('Are you sure you want to delete this material?')) {
            handleDelete(material.id);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            accessor: (row: any) => {
                const name = row.name;
                if (!name) return '';
                if (typeof name === 'string') return name;
                if (typeof name === 'object' && name.en) return name.en;
                if (typeof name === 'object') return Object.values(name)[0];
                return '';
            },
            className: 'text-left',
        },
        {
            key: 'unit',
            header: 'Unit',
            accessor: (row: any) => row.unit,
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
            key: 'date_used',
            header: t('lbl_date_used'),
            accessor: (row: any) => formatDateMedium(row.date_used),
            className: 'text-center',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreateModal}>{t('ttl_add_material')}</Button>
            </div>
            <ResourceTable data={projectMaterials} columns={columns} onEdit={openEditModal} onDelete={handleDeleteClick} isLoading={isLoading} />
            <ResourceFormModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                title={t('ttl_add_material')}
                type="material"
                projectId={Number(project.id)}
                onSuccess={window.location.reload}
            />
            <ResourceFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title={t('ttl_edit_material')}
                type="material"
                projectId={Number(project.id)}
                initialData={selectedResource}
                onSuccess={window.location.reload}
            />
        </div>
    );
}

export default MaterialTab;
