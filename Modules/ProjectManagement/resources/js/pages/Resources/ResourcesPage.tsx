/**
 * ResourcesPage Component
 *
 * This component serves as the main container for managing all project resources.
 * It displays different resource types (manpower, equipment, material, fuel, expense)
 * in a tabbed interface.
 */

import React, { Suspense, lazy, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResourceStore } from '../../stores/resourceStore';
import { AppLayout } from '@/Core';
import type {
    ManpowerResource,
    EquipmentResource,
    MaterialResource,
    FuelResource,
    ExpenseResource
} from '../../types/projectResources';

// Lazy load tab components
const ManpowerTab = lazy(() => import('./Tabs/ManpowerTab').then(mod => ({ default: mod.ManpowerTab })));
const EquipmentTab = lazy(() => import('./Tabs/EquipmentTab').then(mod => ({ default: mod.EquipmentTab })));
const MaterialTab = lazy(() => import('./Tabs/MaterialTab').then(mod => ({ default: mod.MaterialTab })));
const FuelTab = lazy(() => import('./Tabs/FuelTab').then(mod => ({ default: mod.FuelTab })));
const ExpenseTab = lazy(() => import('./Tabs/ExpenseTab').then(mod => ({ default: mod.ExpenseTab })));

interface ResourcesPageProps {
    project: {
        id: number;
        name: string;
    };
    manpowers: ManpowerResource[];
    equipments: EquipmentResource[];
    materials: MaterialResource[];
    fuel: FuelResource[];
    expenses: ExpenseResource[];
    availableEquipment: EquipmentResource[];
}

// Memoize the tab components to prevent unnecessary re-renders
const MemoizedManpowerTab = React.memo(ManpowerTab);
const MemoizedEquipmentTab = React.memo(EquipmentTab);
const MemoizedMaterialTab = React.memo(MaterialTab);
const MemoizedFuelTab = React.memo(FuelTab);
const MemoizedExpenseTab = React.memo(ExpenseTab);

export function ResourcesPage({
    project,
    manpowers,
    equipments,
    materials,
    fuel,
    expenses,
    availableEquipment,
}: ResourcesPageProps) {
  const { t } = useTranslation('project');

    const { setManpowers, setEquipments, setMaterials, setFuel, setExpenses, setAvailableEquipment } = useResourceStore();

    // Memoize the store initialization function
    const initializeStore = useCallback(() => {
        setManpowers(manpowers);
        setEquipments(equipments);
        setMaterials(materials);
        setFuel(fuel);
        setExpenses(expenses);
        setAvailableEquipment(availableEquipment);
    }, [
        manpowers,
        equipments,
        materials,
        fuel,
        expenses,
        availableEquipment,
        setManpowers,
        setEquipments,
        setMaterials,
        setFuel,
        setExpenses,
        setAvailableEquipment,
    ]);

    // Initialize store only once when component mounts
    React.useEffect(() => {
        initializeStore();
    }, [initializeStore]);

    // Memoize the project with string ID
    const projectWithStringId = useMemo(() => ({
        ...project,
        id: project.id.toString()
    }), [project]);

    // Memoize the tab content to prevent unnecessary re-renders
    const tabContent = useMemo(() => (
        <Suspense fallback={<div>Loading...</div>}>
            <TabsContent value="manpower">
                <MemoizedManpowerTab
                    project={project}
                    manpowers={manpowers}
                />
            </TabsContent>

            <TabsContent value="equipment">
                <MemoizedEquipmentTab
                    project={project}
                    equipments={equipments}
                    availableEquipment={availableEquipment}
                />
            </TabsContent>

            <TabsContent value="material">
                <MemoizedMaterialTab
                    project={project}
                    projectMaterials={materials}
                />
            </TabsContent>

            <TabsContent value="fuel">
                <MemoizedFuelTab
                    project={projectWithStringId}
                    fuel={fuel}
                    projectEquipment={availableEquipment}
                />
            </TabsContent>

            <TabsContent value="expense">
                <MemoizedExpenseTab
                    project={project}
                    expenses={expenses}
                />
            </TabsContent>
        </Suspense>
    ), [project, projectWithStringId, manpowers, equipments, materials, fuel, expenses, availableEquipment]);

    return (
        <AppLayout
            title={`${project.name} - Resources`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Projects', href: '/projects' },
                { title: project.name, href: `/projects/${project.id}` },
                { title: 'Resources', href: `/projects/${project.id}/resources` }
            ]}
        >
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{t('project_resources')}</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                            Project: {project.name}
                        </span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('ttl_resource_management')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="manpower" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="manpower">Manpower</TabsTrigger>
                                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                                <TabsTrigger value="material">Material</TabsTrigger>
                                <TabsTrigger value="fuel">Fuel</TabsTrigger>
                                <TabsTrigger value="expense">Expense</TabsTrigger>
                            </TabsList>

                            {tabContent}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

export default ResourcesPage;















