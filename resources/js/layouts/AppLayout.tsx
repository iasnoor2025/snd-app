import React from 'react';

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface AppLayoutProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ title, breadcrumbs, children }) => (
  <div className="min-h-screen bg-red-500 text-foreground">
    <header className="p-4 border-b">
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      {breadcrumbs && (
        <nav className="mt-2">
          <ol className="flex space-x-2 text-sm">
            {breadcrumbs.map((item, idx) => (
              <li key={item.href} className="flex items-center">
                {idx > 0 && <span className="mx-1">/</span>}
                <a href={item.href} className="hover:underline">{item.title}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </header>
    <main className="p-4">{children}</main>
  </div>
);

export default AppLayout;
