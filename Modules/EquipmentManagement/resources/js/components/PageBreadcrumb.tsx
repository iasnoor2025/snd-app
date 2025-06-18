import React from 'react';

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
}

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ items }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex flex-wrap items-center space-x-2 text-sm text-muted-foreground">
      {items.map((item, idx) => (
        <li key={item.href} className="flex items-center">
          {idx > 0 && <span className="mx-1">/</span>}
          {idx < items.length - 1 ? (
            <a href={item.href} className="hover:underline">
              {item.title}
            </a>
          ) : (
            <span className="font-semibold text-foreground">{item.title}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export { PageBreadcrumb };
