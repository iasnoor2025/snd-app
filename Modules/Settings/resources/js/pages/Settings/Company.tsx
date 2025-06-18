import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Mail, Phone, MapPin, Globe, Upload, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface CompanySettings {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_website?: string;
  company_description?: string;
  company_logo?: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
}

interface Props extends PageProps {
  settings: CompanySettings;
  timezones: Array<{ value: string; label: string }>;
  currencies: Array<{ value: string; label: string }>;
}

export default function Company({ auth, settings, timezones, currencies }: Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.company_logo || null);
  const [isUploading, setIsUploading] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    company_name: settings.company_name || '',
    company_email: settings.company_email || '',
    company_phone: settings.company_phone || '',
    company_address: settings.company_address || '',
    company_website: settings.company_website || '',
    company_description: settings.company_description || '',
    timezone: settings.timezone || 'UTC',
    currency: settings.currency || 'SAR',
    date_format: settings.date_format || 'Y-m-d',
    time_format: settings.time_format || 'H:i',
    logo: null as File | null,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('logo', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    post(route('settings.company.update'), {
      onSuccess: () => {
        toast.success('Company settings updated successfully!');
        setIsUploading(false);
      },
      onError: () => {
        toast.error('Failed to update company settings. Please try again.');
        setIsUploading(false);
      },
    });
  };

  const dateFormats = [
    { value: 'Y-m-d', label: 'YYYY-MM-DD (2024-12-20)' },
    { value: 'm/d/Y', label: 'MM/DD/YYYY (12/20/2024)' },
    { value: 'd/m/Y', label: 'DD/MM/YYYY (20/12/2024)' },
    { value: 'd-m-Y', label: 'DD-MM-YYYY (20-12-2024)' },
    { value: 'F j, Y', label: 'Month DD, YYYY (December 20, 2024)' },
  ];

  const timeFormats = [
    { value: 'H:i', label: '24 Hour (14:30)' },
    { value: 'h:i A', label: '12 Hour (2:30 PM)' },
    { value: 'H:i:s', label: '24 Hour with Seconds (14:30:45)' },
    { value: 'h:i:s A', label: '12 Hour with Seconds (2:30:45 PM)' },
  ];

  return (
    <AdminLayout
      user={auth.user}
      header={
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6" />
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Company Settings
          </h2>
        </div>
      }
    >
      <Head title="Company Settings" />

      <div className="py-6">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
                <CardDescription>
                  Basic information about your company that will be displayed throughout the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Logo */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Company Logo"
                          className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Upload a logo for your company. Recommended size: 200x200px. Max file size: 2MB.
                      </p>
                      {errors.logo && (
                        <p className="text-sm text-red-600 mt-1">{errors.logo}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Company Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={data.company_name}
                      onChange={(e) => setData('company_name', e.target.value)}
                      placeholder="Enter company name"
                      required
                    />
                    {errors.company_name && (
                      <p className="text-sm text-red-600">{errors.company_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company_website"
                        value={data.company_website}
                        onChange={(e) => setData('company_website', e.target.value)}
                        placeholder="https://www.company.com"
                        className="pl-10"
                      />
                    </div>
                    {errors.company_website && (
                      <p className="text-sm text-red-600">{errors.company_website}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company_email"
                        type="email"
                        value={data.company_email}
                        onChange={(e) => setData('company_email', e.target.value)}
                        placeholder="info@company.com"
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.company_email && (
                      <p className="text-sm text-red-600">{errors.company_email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="company_phone"
                        value={data.company_phone}
                        onChange={(e) => setData('company_phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                    {errors.company_phone && (
                      <p className="text-sm text-red-600">{errors.company_phone}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="company_address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="company_address"
                      value={data.company_address}
                      onChange={(e) => setData('company_address', e.target.value)}
                      placeholder="Enter company address"
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                  {errors.company_address && (
                    <p className="text-sm text-red-600">{errors.company_address}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="company_description">Description</Label>
                  <Textarea
                    id="company_description"
                    value={data.company_description}
                    onChange={(e) => setData('company_description', e.target.value)}
                    placeholder="Brief description of your company"
                    className="min-h-[100px]"
                  />
                  {errors.company_description && (
                    <p className="text-sm text-red-600">{errors.company_description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Configure system-wide settings for your organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={data.timezone} onValueChange={(value) => setData('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones?.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.timezone && (
                      <p className="text-sm text-red-600">{errors.timezone}</p>
                    )}
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies?.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.currency && (
                      <p className="text-sm text-red-600">{errors.currency}</p>
                    )}
                  </div>

                  {/* Date Format */}
                  <div className="space-y-2">
                    <Label htmlFor="date_format">Date Format</Label>
                    <Select value={data.date_format} onValueChange={(value) => setData('date_format', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.date_format && (
                      <p className="text-sm text-red-600">{errors.date_format}</p>
                    )}
                  </div>

                  {/* Time Format */}
                  <div className="space-y-2">
                    <Label htmlFor="time_format">Time Format</Label>
                    <Select value={data.time_format} onValueChange={(value) => setData('time_format', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.time_format && (
                      <p className="text-sm text-red-600">{errors.time_format}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={processing || isUploading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <Button
                type="submit"
                disabled={processing || isUploading}
                className="min-w-[120px]"
              >
                {processing || isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
