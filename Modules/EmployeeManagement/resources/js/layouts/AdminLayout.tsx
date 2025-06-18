import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '../types';
import AppLayout from '@/layouts/app-layout';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  requiredPermission?: string;
}

export default function AdminLayout({
  children,
  title = 'Dashboard',
  breadcrumbs = [],
  requiredPermission
}: AdminLayoutProps) {
  const { t } = useTranslation('employee');

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={title} />
      {children}
    </AppLayout>
  );
}
