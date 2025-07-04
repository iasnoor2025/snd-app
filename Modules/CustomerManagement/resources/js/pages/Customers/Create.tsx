import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { BreadcrumbItem } from "@/Core/types";
import { AppLayout } from '@/Core';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea
} from "@/Core";
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function Create() {
  const { t } = useTranslation('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [document, setDocument] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('notes', notes);
    if (document) {
      formData.append('document', document);
    }
    router.post('/customers', formData, {
      forceFormData: true,
      onSuccess: () => {
        toast.success('Customer created successfully');
      },
      onError: (errors) => {
        setErrors(errors);
        toast.error('Failed to create customer');
      },
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Customers', href: '/customers' },
    { title: 'Create', href: '/customers/create' },
  ];

  return (
    <AppLayout
      title="Create Customer"
      breadcrumbs={breadcrumbs}
      requiredPermission="customers.create"
    >
      <Head title="Create Customer" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Create Customer
              </CardTitle>
              <CardDescription>
                Add a new customer to the system
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/customers">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Customers
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter customer name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter notes"
                    className={errors.notes ? 'border-red-500' : ''}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="document">Customer Document</Label>
                  <Input
                    id="document"
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setDocument(e.target.files?.[0] || null)}
                    className={errors.document ? 'border-red-500' : ''}
                  />
                  {errors.document && (
                    <p className="text-sm text-red-500 mt-1">{errors.document}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Create Customer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}














