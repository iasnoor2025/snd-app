import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/Core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Core";
import { Pencil, Trash2 } from 'lucide-react';
import { ResourceFormModal } from '../../../components/project/resources/ResourceModal';
import { useResourceFormModal } from '../../../hooks/useResourceFormModal';
import { useResourceSubmit } from '../../../hooks/useResourceSubmit';
import { formatCurrency } from '../../../lib/utils';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

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
            // Refresh the list of expenses
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
                <Button onClick={openCreateModal}>{t('ttl_add_expense')}</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>{formatCurrency(expense.amount)}</TableCell>
                            <TableCell>{formatDateMedium(expense.date)}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEditModal(expense)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteClick(expense)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ResourceFormModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                title={t('ttl_add_expense')}
                type="expense"
                projectId={project.id}
                onSuccess={handleCreateSuccess}
            />

            <ResourceFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title={t('ttl_edit_expense')}
                type="expense"
                projectId={project.id}
                initialData={selectedResource}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
}

export default ExpenseTab;














