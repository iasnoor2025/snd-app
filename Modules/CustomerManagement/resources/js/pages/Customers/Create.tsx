import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Head, Link } from '@inertiajs/react';
import type { PageProps } from '../../types/index.d';
import { AdminLayout, Input, Button, Card, CardContent, CardHeader, CardTitle } from '@/Modules/Core/resources/js';
import { route } from 'ziggy-js';
// import Permission from '@/Modules/Core/resources/js/components/Permission';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Customers', href: route('customers.index') },
  { title: 'Create', href: route('customers.create') },
];

const CreateCustomer: React.FC<PageProps> = (props) => {
  const { t } = useTranslation('customer');
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    zip: '',
    country: '',
    website: '',
    tax_id: '',
    tax_number: '',
    payment_terms: '',
    credit_limit: '',
    is_active: true,
    status: 'active',
    notes: '',
    user_id: '',
  });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
  const { t } = useTranslation('customer');

    e.preventDefault();
    post(route('customers.store'), {
      onError: (err) => setError('Failed to create customer.'),
      onSuccess: () => setError(null),
    });
  }

  return (
    <AdminLayout title={t('ttl_create_customer')} breadcrumbs={breadcrumbs}>
      <Head title={t('ttl_create_customer')} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('ttl_create_customer')}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">{t('name')}</label>
                  <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                  {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
                </div>
                <div>
                  <label className="block mb-1">{t('lbl_contact_person')}</label>
                  <Input value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} />
                  {errors.contact_person && <div className="text-red-500 text-xs">{errors.contact_person}</div>}
                </div>
                <div>
                  <label className="block mb-1">{t('email')}</label>
                  <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                  {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
                </div>
                <div>
                  <label className="block mb-1">{t('phone')}</label>
                  <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                  {errors.phone && <div className="text-red-500 text-xs">{errors.phone}</div>}
                </div>
                <div>
                  <label className="block mb-1">Address</label>
                  <Input value={data.address} onChange={e => setData('address', e.target.value)} />
                  {errors.address && <div className="text-red-500 text-xs">{errors.address}</div>}
                </div>
                <div>
                  <label className="block mb-1">City</label>
                  <Input value={data.city} onChange={e => setData('city', e.target.value)} />
                  {errors.city && <div className="text-red-500 text-xs">{errors.city}</div>}
                </div>
                <div>
                  <label className="block mb-1">State</label>
                  <Input value={data.state} onChange={e => setData('state', e.target.value)} />
                  {errors.state && <div className="text-red-500 text-xs">{errors.state}</div>}
                </div>
                <div>
                  <label className="block mb-1">Postal Code</label>
                  <Input value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} />
                  {errors.postal_code && <div className="text-red-500 text-xs">{errors.postal_code}</div>}
                </div>
                <div>
                  <label className="block mb-1">Zip</label>
                  <Input value={data.zip} onChange={e => setData('zip', e.target.value)} />
                  {errors.zip && <div className="text-red-500 text-xs">{errors.zip}</div>}
                </div>
                <div>
                  <label className="block mb-1">Country</label>
                  <Input value={data.country} onChange={e => setData('country', e.target.value)} />
                  {errors.country && <div className="text-red-500 text-xs">{errors.country}</div>}
                </div>
                <div>
                  <label className="block mb-1">Website</label>
                  <Input type="url" value={data.website} onChange={e => setData('website', e.target.value)} />
                  {errors.website && <div className="text-red-500 text-xs">{errors.website}</div>}
                </div>
                <div>
                  <label className="block mb-1">{t('lbl_tax_id')}</label>
                  <Input value={data.tax_id} onChange={e => setData('tax_id', e.target.value)} />
                  {errors.tax_id && <div className="text-red-500 text-xs">{errors.tax_id}</div>}
                </div>
                <div>
                  <label className="block mb-1">Tax Number</label>
                  <Input value={data.tax_number} onChange={e => setData('tax_number', e.target.value)} />
                  {errors.tax_number && <div className="text-red-500 text-xs">{errors.tax_number}</div>}
                </div>
                <div>
                  <label className="block mb-1">{t('lbl_payment_terms')}</label>
                  <Input value={data.payment_terms} onChange={e => setData('payment_terms', e.target.value)} />
                  {errors.payment_terms && <div className="text-red-500 text-xs">{errors.payment_terms}</div>}
                </div>
                <div>
                  <label className="block mb-1">Credit Limit</label>
                  <Input type="number" step="0.01" value={data.credit_limit} onChange={e => setData('credit_limit', e.target.value)} />
                  {errors.credit_limit && <div className="text-red-500 text-xs">{errors.credit_limit}</div>}
                </div>
                <div>
                  <label className="block mb-1">Status</label>
                  <select className="w-full border rounded px-2 py-1" value={data.status} onChange={e => setData('status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {errors.status && <div className="text-red-500 text-xs">{errors.status}</div>}
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={data.is_active} 
                      onChange={e => setData('is_active', e.target.checked)} 
                    />
                    Is Active
                  </label>
                  {errors.is_active && <div className="text-red-500 text-xs">{errors.is_active}</div>}
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Notes</label>
                  <textarea className="w-full border rounded px-2 py-1" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                  {errors.notes && <div className="text-red-500 text-xs">{errors.notes}</div>}
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">{t('lbl_user_id')}</label>
                  <Input value={data.user_id} onChange={e => setData('user_id', e.target.value)} />
                  {errors.user_id && <div className="text-red-500 text-xs">{errors.user_id}</div>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={processing}>Create</Button>
                <Button asChild variant="outline">
                  <Link href={route('customers.index')}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateCustomer;














