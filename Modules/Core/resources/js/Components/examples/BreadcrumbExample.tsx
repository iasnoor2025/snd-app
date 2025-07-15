import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BreadcrumbItem } from '../../types';
import { Breadcrumb } from '../ui/breadcrumb';

/**
 * Example component demonstrating how to convert breadcrumbs
 * from using hardcoded strings to react-i18next
 */
const BreadcrumbExample: React.FC = () => {
    // Use the useTranslation hook to access translation functions
    const { t } = useTranslation(['common', 'employees']);

    // Define breadcrumbs with translated strings
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('common:dashboard'),
            href: '/dashboard',
        },
        {
            title: t('employees:employees'),
            href: '/employees',
        },
        {
            title: t('employees:employee_details'),
            href: '/employees/show',
        },
    ];

    return (
        <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold">{t('employees:employee_details')}</h1>
            <Breadcrumb>
                {breadcrumbs.map((breadcrumb, index) => (
                    <Breadcrumb.Item key={index}>
                        {index === breadcrumbs.length - 1 ? breadcrumb.title : <Link href={breadcrumb.href}>{breadcrumb.title}</Link>}
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
        </div>
    );
};

export default BreadcrumbExample;
