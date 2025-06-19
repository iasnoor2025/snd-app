import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Modules/Core/resources/js/components/ui/dialog';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import ResourceForm from '../ResourceForm';

type ResourceType = 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense';

export default function ResourceDialogDebug({ projectId = 1 }: { projectId: number }) {
  const { t } = useTranslation('project');

    // Tab selection
    const [selectedType, setSelectedType] = useState<ResourceType>('manpower');

    // Separate dialog states
    const [manpowerOpen, setManpowerOpen] = useState(false);
    const [equipmentOpen, setEquipmentOpen] = useState(false);
    const [materialOpen, setMaterialOpen] = useState(false);
    const [fuelOpen, setFuelOpen] = useState(false);
    const [expenseOpen, setExpenseOpen] = useState(false);

    const handleTabChange = (type: ResourceType) => {
        console.log('Tab changed to:', type);
        setSelectedType(type);
    };

    const handleAddResource = () => {
        console.log('Adding resource of type:', selectedType);

        switch (selectedType) {
            case 'manpower':
                setManpowerOpen(true);
                break;
            case 'equipment':
                setEquipmentOpen(true);
                break;
            case 'material':
                setMaterialOpen(true);
                break;
            case 'fuel':
                setFuelOpen(true);
                break;
            case 'expense':
                setExpenseOpen(true);
                break;
        }
    };

    const handleSuccess = () => {
        setManpowerOpen(false);
        setEquipmentOpen(false);
        setMaterialOpen(false);
        setFuelOpen(false);
        setExpenseOpen(false);
        console.log('Resource added successfully');
    };

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-2">
                <h2 className="text-xl font-bold">{t('resource_dialog_debug')}</h2>
                <p>Current tab: {selectedType}</p>
            </div>

            <div className="flex space-x-2 border-b pb-2">
                <Button variant={selectedType === 'manpower' ? 'default' : 'outline'} onClick={() => handleTabChange('manpower')}>
                    Manpower
                </Button>
                <Button variant={selectedType === 'equipment' ? 'default' : 'outline'} onClick={() => handleTabChange('equipment')}>
                    Equipment
                </Button>
                <Button variant={selectedType === 'material' ? 'default' : 'outline'} onClick={() => handleTabChange('material')}>
                    Material
                </Button>
                <Button variant={selectedType === 'fuel' ? 'default' : 'outline'} onClick={() => handleTabChange('fuel')}>
                    Fuel
                </Button>
                <Button variant={selectedType === 'expense' ? 'default' : 'outline'} onClick={() => handleTabChange('expense')}>
                    Expense
                </Button>
            </div>

            <Button onClick={handleAddResource}>Add {selectedType}</Button>

            {/* Manpower Dialog */}
            <Dialog open={manpowerOpen} onOpenChange={setManpowerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_add_manpower')}</DialogTitle>
                        <DialogDescription>{t('add_a_new_manpower_resource')}</DialogDescription>
                    </DialogHeader>
                    <ResourceForm
                        type="manpower"
                        projectId={projectId}
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>

            {/* Equipment Dialog */}
            <Dialog open={equipmentOpen} onOpenChange={setEquipmentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_add_equipment')}</DialogTitle>
                        <DialogDescription>{t('add_a_new_equipment_resource')}</DialogDescription>
                    </DialogHeader>
                    <ResourceForm
                        type="equipment"
                        projectId={projectId}
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>

            {/* Material Dialog */}
            <Dialog open={materialOpen} onOpenChange={setMaterialOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_add_material')}</DialogTitle>
                        <DialogDescription>{t('add_a_new_material_resource')}</DialogDescription>
                    </DialogHeader>
                    <ResourceForm
                        type="material"
                        projectId={projectId}
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>

            {/* Fuel Dialog */}
            <Dialog open={fuelOpen} onOpenChange={setFuelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_add_fuel')}</DialogTitle>
                        <DialogDescription>{t('add_a_new_fuel_resource')}</DialogDescription>
                    </DialogHeader>
                    <ResourceForm
                        type="fuel"
                        projectId={projectId}
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>

            {/* Expense Dialog */}
            <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_add_expense')}</DialogTitle>
                        <DialogDescription>{t('add_a_new_expense_resource')}</DialogDescription>
                    </DialogHeader>
                    <ResourceForm
                        type="expense"
                        projectId={projectId}
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>

            <div className="mt-4 p-4 border rounded bg-gray-50">
                <h3 className="font-bold">Debug Info:</h3>
                <pre className="text-xs mt-2">
                    {JSON.stringify({
                        selectedType,
                        dialogStates: {
                            manpower: manpowerOpen,
                            equipment: equipmentOpen,
                            material: materialOpen,
                            fuel: fuelOpen,
                            expense: expenseOpen
                        }
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
}














