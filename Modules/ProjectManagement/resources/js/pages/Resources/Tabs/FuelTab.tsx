import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/Core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Core";
import { Pencil, Trash2 } from 'lucide-react';
import { ResourceFormModal } from '../../../components/project/resources/ResourceModal';
import { useResourceFormModal } from '../../../hooks/useResourceFormModal';
import { useResourceSubmit } from '../../../hooks/useResourceSubmit';
import { formatCurrency } from '../../../lib/utils';
import { usePage } from '@inertiajs/react';
import { getTranslation } from '@/Core/utils/translation';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

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

    // Extract locale from Inertia shared props
    const { locale = 'en' } = usePage<any>().props;

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
        type: 'fuel',
        onSuccess: () => {
            // Refresh the list of fuel
            window.location.reload();
        }
    });

    const { isSubmitting, handleSubmit, handleUpdate, handleDelete } = useResourceSubmit({
        projectId: Number(project.id),
        type: 'fuel',
        onSuccess: () => {
            closeCreateModal();
            closeEditModal();
            window.location.reload();
        }
    });

    const handleDeleteClick = (fuelItem: any) => {
        if (window.confirm('Are you sure you want to delete this fuel record?')) {
            handleDelete(fuelItem.id);
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
                <Button onClick={openCreateModal}>{t('ttl_add_fuel')}</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead>{t('lbl_fuel_type')}</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>{t('lbl_unit_price')}</TableHead>
                        <TableHead>{t('th_total_cost')}</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fuel.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.equipment.name}</TableCell>
                            <TableCell>{item.fuel_type}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                            <TableCell>{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                            <TableCell>{formatDateMedium(item.date)}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEditModal(item)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteClick(item)}
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
                title={t('ttl_add_fuel')}
                type="fuel"
                projectId={Number(project.id)}
                onSuccess={handleCreateSuccess}
            />

            <ResourceFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title={t('ttl_edit_fuel')}
                type="fuel"
                projectId={Number(project.id)}
                initialData={selectedResource}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
}

export default FuelTab;














