import { Button } from '@/Core';
import { useForm } from '@inertiajs/react';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EquipmentToastService } from '../../services/EquipmentToastService';
import { Modal } from '../Modal';
import { EquipmentDetails } from './EquipmentDetails';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentList } from './EquipmentList';

interface Equipment {
    id: number;
    name: string;
    description: string;
    category: string;
    daily_rate: number;
    weekly_rate: number;
    monthly_rate: number;
    status: 'available' | 'rented' | 'maintenance' | 'retired';
    serial_number: string;
    purchase_date: string;
    last_maintenance_date: string;
    notes: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    equipment: Equipment[];
}

export const EquipmentManagement: FC<Props> = ({ equipment }) => {
    const { t } = useTranslation('equipment');
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const form = useForm({
        name: '',
        description: '',
        category: '',
        daily_rate: 0,
        weekly_rate: 0,
        monthly_rate: 0,
        status: 'available' as const,
        serial_number: '',
        purchase_date: '',
        last_maintenance_date: '',
        notes: '',
    });

    const handleCreate = async () => {
        try {
            EquipmentToastService.processingEquipment('create');

            await form.post('/equipment', {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    form.reset();
                    EquipmentToastService.equipmentCreated(form.data.name);
                },
                onError: (error) => {
                    EquipmentToastService.equipmentProcessFailed('create', error?.message);
                },
            });
        } catch (error) {
            EquipmentToastService.equipmentProcessFailed('create', error?.message);
        }
    };

    const handleEdit = (equipment: Equipment) => {
        setSelectedEquipment(equipment);
        form.setData({
            name: equipment.name,
            description: equipment.description,
            category: equipment.category,
            daily_rate: equipment.daily_rate,
            weekly_rate: equipment.weekly_rate,
            monthly_rate: equipment.monthly_rate,
            status: equipment.status,
            serial_number: equipment.serial_number,
            purchase_date: equipment.purchase_date,
            last_maintenance_date: equipment.last_maintenance_date,
            notes: equipment.notes,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedEquipment) return;

        try {
            EquipmentToastService.processingEquipment('update');

            await form.put(`/equipment/${selectedEquipment.id}`, {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedEquipment(null);
                    form.reset();
                    EquipmentToastService.equipmentUpdated(form.data.name);
                },
                onError: (error) => {
                    EquipmentToastService.equipmentProcessFailed('update', error?.message);
                },
            });
        } catch (error) {
            EquipmentToastService.equipmentProcessFailed('update', error?.message);
        }
    };

    const handleDelete = async (equipment: Equipment) => {
        try {
            EquipmentToastService.processingEquipment('delete');

            await form.delete(`/equipment/${equipment.id}`, {
                onSuccess: () => {
                    EquipmentToastService.equipmentDeleted(equipment.name);
                },
                onError: (error) => {
                    EquipmentToastService.equipmentProcessFailed('delete', error?.message);
                },
            });
        } catch (error) {
            EquipmentToastService.equipmentProcessFailed('delete', error?.message);
        }
    };

    const handleStatusChange = async (equipment: Equipment, newStatus: Equipment['status']) => {
        try {
            EquipmentToastService.processingEquipment('status update');

            await form.put(`/equipment/${equipment.id}/status`, {
                status: newStatus,
                onSuccess: () => {
                    EquipmentToastService.statusUpdated(equipment.name, newStatus);
                },
                onError: (error) => {
                    EquipmentToastService.statusUpdateFailed(equipment.name, error?.message);
                },
            });
        } catch (error) {
            EquipmentToastService.statusUpdateFailed(equipment.name, error?.message);
        }
    };

    const handleViewDetails = (equipment: Equipment) => {
        setSelectedEquipment(equipment);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t('equipment_management')}</h2>
                <Button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center">
                    {t('add_equipment')}
                </Button>
            </div>

            <EquipmentList
                equipment={equipment}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
            />

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('add_new_equipment')}>
                <EquipmentForm form={form} onSubmit={handleCreate} submitLabel={t('create_equipment')} />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEquipment(null);
                }}
                title={t('edit_equipment')}
            >
                <EquipmentForm form={form} onSubmit={handleUpdate} submitLabel={t('update_equipment')} />
            </Modal>

            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedEquipment(null);
                }}
                title={t('equipment_details')}
            >
                {selectedEquipment && (
                    <EquipmentDetails
                        equipment={selectedEquipment}
                        onEdit={() => {
                            setIsDetailsModalOpen(false);
                            handleEdit(selectedEquipment);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};
