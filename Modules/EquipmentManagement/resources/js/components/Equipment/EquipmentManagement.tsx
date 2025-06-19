import { FC, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { EquipmentList } from './EquipmentList';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentDetails } from './EquipmentDetails';
import { Modal } from '../Modal';

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
    })

    const handleCreate = () => {
        form.post('/equipment', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                form.reset();
            },
        })
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
        })
        setIsEditModalOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedEquipment) return;

        form.put(`/equipment/${selectedEquipment.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedEquipment(null);
                form.reset();
            },
        })
    };

    const handleViewDetails = (equipment: Equipment) => {
        setSelectedEquipment(equipment);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Equipment Management</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    Add Equipment
                </button>
            </div>

            <EquipmentList
                equipment={equipment}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
            />

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Equipment"
                <EquipmentForm
                    form={form}
                    onSubmit={handleCreate}
                    submitLabel="Create Equipment"
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEquipment(null);
                }}
                title="Edit Equipment"
                <EquipmentForm
                    form={form}
                    onSubmit={handleUpdate}
                    submitLabel="Update Equipment"
                />
            </Modal>

            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedEquipment(null);
                }}
                title="Equipment Details"
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

















