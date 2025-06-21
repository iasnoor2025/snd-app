import React, { useState } from 'react';
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
import { ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface Props {
  customer: Customer;
}

export default function Edit({ customer }: Props) {
  const { t } = useTranslation('customer');
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone);
  const [address, setAddress] = useState(customer.address);
  const [notes, setNotes] = useState(customer.notes);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    router.put(`/customers/${customer.id}`, {
      name,
      email,
      phone,
      address,
      notes,
    }, {
      onSuccess: () => {
        toast.success('Customer updated successfully');
      },
      onError: (errors) => {
        setErrors(errors);
        toast.error('Failed to update customer');
      },
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Customers', href: '/customers' },
    { title: customer.name, href: `/customers/${customer.id}` },
    { title: 'Edit', href: `/customers/${customer.id}/edit` },
  ];

  return (
    <AppLayout 
      title={`Edit Customer: ${customer.name}`} 
      breadcrumbs={breadcrumbs} 
      requiredPermission="customers.edit"
    >
      <Head title={`Edit Customer: ${customer.name}`} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                Edit Customer: {customer.name}
              </CardTitle>
              <CardDescription>
                Update customer information
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
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Update Customer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}














