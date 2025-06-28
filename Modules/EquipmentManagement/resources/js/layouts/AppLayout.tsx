import React from 'react';
import { Head } from '@inertiajs/react';

interface AppLayoutProps {
  title?: string;
  breadcrumbs?: Array<{ title: string; href: string }>;
  requiredPermission?: string;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ title, breadcrumbs, requiredPermission, children }) => {
  return (
    <div>
      <Head title={title || 'App'} />
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex space-x-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, idx) => (
              <li key={crumb.href} className="flex items-center">
                {idx > 0 && <span className="mx-2">/</span>}
                <a href={crumb.href} className="hover:underline">
                  {crumb.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default AppLayout; 