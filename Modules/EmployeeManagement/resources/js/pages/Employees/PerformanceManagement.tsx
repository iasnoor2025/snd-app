import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { PerformanceReview } from '../../types/employee';
import PerformanceReviewList from '../../components/employees/PerformanceReviewList';
import PerformanceReviewForm from '../../components/employees/PerformanceReviewForm';
import { Breadcrumbs } from '@/Modules/Core/resources/js/components/breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Modules/Core/resources/js/components/ui/tabs';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

export default function PerformanceManagement({ employeeId }: { employeeId?: string }) {
  const { t } = useTranslation('employee');

  const [activeTab, setActiveTab] = useState('list');
  const [currentReview, setCurrentReview] = useState<PerformanceReview | undefined>(undefined);

  const handleCreateNew = () => {
    setCurrentReview(undefined);
    setActiveTab('create');
  };

  const handleEdit = (review: PerformanceReview) => {
    setCurrentReview(review);
    setActiveTab('edit');
  };

  const handleSave = (review: PerformanceReview) => {
    setActiveTab('list');
  };

  const handleCancel = () => {
    setCurrentReview(undefined);
    setActiveTab('list');
  };

  const renderBreadcrumbs = () => {
    const crumbs = [
      { title: 'Dashboard', href: '/' },
      { title: 'Employees', href: '/employees' }
    ];

    if (employeeId) {
      crumbs.push({ title: 'Employee Details', href: `/employees/${employeeId}` });
    }

    crumbs.push({ title: 'Performance Management', href: '#' });

    return <Breadcrumbs breadcrumbs={crumbs} />;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {renderBreadcrumbs()}
          <h1 className="text-3xl font-bold tracking-tight">{t('performance_management')}</h1>
          <p className="text-muted-foreground">
            {activeTab === 'list'
              ? 'View and manage employee performance reviews'
              : activeTab === 'create'
              ? 'Create a new performance review'
              : 'Edit performance review'}
          </p>
        </div>
        {activeTab === 'list' ? (
          <Button onClick={handleCreateNew} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            New Review
          </Button>
        ) : (
          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          <TabsTrigger value="list">Reviews</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0">
          <PerformanceReviewList
            employeeId={employeeId ? parseInt(employeeId) : undefined}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <PerformanceReviewForm
            employeeId={employeeId ? parseInt(employeeId) : undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-0">
          <PerformanceReviewForm
            review={currentReview}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

















