import React from 'react';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface AdminLayoutProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  requiredPermission?: string;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, breadcrumbs = [], requiredPermission, children }) => {
  // Always start with Dashboard
  const dashboardCrumb = { title: 'Dashboard', href: '/dashboard' };
  let finalBreadcrumbs: BreadcrumbItem[] = [];

  if (!breadcrumbs || breadcrumbs.length === 0) {
    // Auto-generate: Dashboard > current page
    finalBreadcrumbs = [
      dashboardCrumb,
      { title: title || 'Current', href: window.location.pathname },
    ];
  } else {
    // If first is not Dashboard, prepend it
    if (breadcrumbs[0].title !== 'Dashboard') {
      finalBreadcrumbs = [dashboardCrumb, ...breadcrumbs];
    } else {
      finalBreadcrumbs = breadcrumbs;
    }
  }

  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="mt-2">
            <Breadcrumbs breadcrumbs={finalBreadcrumbs} />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AppShell>
  );
};

export default AdminLayout;
