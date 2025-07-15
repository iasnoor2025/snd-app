import { AppLayout, Badge, Button, Card, CardContent, CardHeader } from '@/Core';
import { formatDateTime } from '@/Core/utils/dateFormatter';
import { Head, Link } from '@inertiajs/react';
import { BadgeDollarSign, Calendar, Globe, Info, Mail, Phone, User, UserCheck, UserX } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { route } from 'ziggy-js';
import type { Customer, PageProps } from '../../types/index.d';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Customers', href: route('customers.index') },
    { title: 'Show', href: '#' },
];

interface Props extends PageProps {
    customer: Customer;
    attachments?: any[];
    rentals?: any;
    invoices?: any;
    payments?: any;
    user?: any;
    translations?: any;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    countries?: any[];
}

const ShowCustomer: React.FC<Props> = ({
    customer,
    attachments = [],
    rentals = {},
    invoices = {},
    payments = {},
    user = {},
    translations = {},
    created_at,
    updated_at,
    deleted_at,
    countries = [],
}) => {
    const { t } = useTranslation('customer');

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            inactive: 'secondary',
        };
        return (
            <Badge variant={variants[status] || 'outline'} className="px-2 py-1 text-xs">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout title={t('ttl_customer_details')} breadcrumbs={breadcrumbs}>
            <Head title={t('ttl_customer_details')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card className="w-full border border-muted-foreground/10 bg-muted/50 shadow-lg">
                    {/* Header Section */}
                    <CardHeader className="flex flex-col gap-6 border-b border-muted-foreground/10 bg-white/80 px-8 py-10 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">{customer.name}</span>
                                    {getStatusBadge(customer.status)}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    {customer.contact_person || <span className="text-muted-foreground">-</span>}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2 md:mt-0">
                            <Button asChild variant="secondary">
                                <Link href={route('customers.edit', customer.id)}>{t('edit')}</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={route('customers.index')}>{t('back')}</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Info Sections */}
                    <CardContent className="px-4 py-12 md:px-12 lg:px-24">
                        {/* Contact & Address */}
                        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2">
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                                    <Info className="h-5 w-5" />
                                    {t('contact_information')}
                                </h3>
                                <div className="mb-2 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{t('email')}:</span>
                                    <span>{customer.email || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{t('phone')}:</span>
                                    <span>{customer.phone || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{t('website')}:</span>
                                    {customer.website ? (
                                        <a
                                            href={customer.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {customer.website}
                                        </a>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('address')}:</span>
                                    <span>{customer.address || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('city')}:</span>
                                    <span>{customer.city || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('state')}:</span>
                                    <span>{customer.state || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('postal_code')}:</span>
                                    <span>{customer.postal_code || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('country')}:</span>
                                    <span>{customer.country || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                            </div>
                            {/* Financial & Other Info */}
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                                    <BadgeDollarSign className="h-5 w-5" />
                                    {t('financial_information')}
                                </h3>
                                <div className="mb-2 flex items-center gap-2">
                                    <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{t('credit_limit')}:</span>
                                    <span>
                                        {customer.credit_limit ? `$${customer.credit_limit}` : <span className="text-muted-foreground">-</span>}
                                    </span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('tax_id')}:</span>
                                    <span>{customer.tax_id || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('tax_number')}:</span>
                                    <span>{customer.tax_number || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('payment_terms')}:</span>
                                    <span>{customer.payment_terms || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('is_active')}:</span>
                                    {customer.is_active ? (
                                        <Badge variant="default" className="flex items-center gap-1 px-2 py-1 text-xs">
                                            <UserCheck className="h-3 w-3" /> {t('active')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="flex items-center gap-1 px-2 py-1 text-xs">
                                            <UserX className="h-3 w-3" /> {t('inactive')}
                                        </Badge>
                                    )}
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">{t('notes')}:</span>
                                    <span>{customer.notes || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="font-medium">User ID:</span>
                                    <span>{customer.user_id || <span className="text-muted-foreground">-</span>}</span>
                                </div>
                            </div>
                        </div>
                        {/* Dates Section */}
                        <div className="mt-8 grid grid-cols-1 gap-12 border-t border-muted-foreground/10 pt-8 md:grid-cols-2">
                            <div className="mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{t('created_at')}:</span>
                                <span>{formatDateTime(customer.created_at) || <span className="text-muted-foreground">-</span>}</span>
                            </div>
                            <div className="mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{t('updated_at')}:</span>
                                <span>{formatDateTime(customer.updated_at) || <span className="text-muted-foreground">-</span>}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ShowCustomer;
