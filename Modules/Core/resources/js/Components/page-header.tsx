import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => (
    <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
);

export default PageHeader;
