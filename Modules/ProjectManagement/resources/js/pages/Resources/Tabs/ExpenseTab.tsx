import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/Core";
import { Pencil, Trash2 } from 'lucide-react';
import { ResourceFormModal } from '../../../components/project/resources/ResourceModal';
import { useResourceFormModal } from '../../../hooks/useResourceFormModal';
import { useResourceSubmit } from '../../../hooks/useResourceSubmit';
import { formatCurrency } from '../../../lib/utils';
import { formatDateMedium } from '@/Core/utils/dateFormatter';
import { ResourceTable } from '../../../Components/project/resources/ResourceTable';

interface ExpenseTabProps {
    project: {
        id: number;
    };
    expenses: any[];
}

export function ExpenseTab({ project, expenses }: ExpenseTabProps) {
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
        type: 'expense',
        onSuccess: () => {
            window.location.reload();
        }
    });

    const { isSubmitting, handleSubmit, handleUpdate, handleDelete } = useResourceSubmit({
        projectId: project.id,
        type: 'expense',
        onSuccess: () => {
            closeCreateModal();
            closeEditModal();
            window.location.reload();
        }
    });

    const handleDeleteClick = (expense: any) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            handleDelete(expense.id);
        }
    };

    const columns = [
        {
            key: 'category',
            header: 'Category',
            accessor: (row: any) => row.category,
            className: 'text-left',
        },
        {
            key: 'description',
            header: 'Description',
            accessor: (row: any) => row.description,
            className: 'text-left',
        },
        {
            key: 'amount',
            header: 'Amount',
            accessor: (row: any) => formatCurrency(row.amount),
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
                <Button onClick={openCreateModal}>{t('ttl_add_expense')}</Button>
            </div>
            <ResourceTable
                data={expenses}
                columns={columns}
                onEdit={openEditModal}
                onDelete={handleDeleteClick}
                isLoading={isLoading}
            />
            <ResourceFormModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                title={t('ttl_add_expense')}
                type="expense"
                projectId={project.id}
                onSuccess={window.location.reload}
            />
            <ResourceFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title={t('ttl_edit_expense')}
                type="expense"
                projectId={project.id}
                initialData={selectedResource}
                onSuccess={window.location.reload}
            />
        </div>
    );
}

export default ExpenseTab;














