import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-bold mb-1">{title}</h1>
    {description && <p className="text-muted-foreground text-sm">{description}</p>}
  </div>
);

export default PageHeader;
