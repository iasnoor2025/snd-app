import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import type { PageProps } from "@/types";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from 'lucide-react';
import CreateButton from "@/components/shared/CreateButton";
import CrudButtons from "@/components/shared/CrudButtons";
import { formatCurrency } from "@/utils/format";
import { useTranslation } from 'react-i18next';
import { Equipment, PaginatedData } from '../../types';

interface Props extends PageProps {
  equipment: PaginatedData<Equipment>;
  categories: string[];
  statuses: Record<string, string>;
  filters?: Record<string, any>;
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Equipment', href: '/equipment' },
];

export default function Index({ equipment, categories = [], statuses = {}, filters = {} }: Props) {
  const { t } = useTranslation('equipment');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchQuery });
  };

  const applyFilters = (newFilters: Record<string, any>) => {
    const updatedFilters = {
      ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
      ...(selectedStatus !== 'all' ? { status: selectedStatus } : {}),
      ...(searchQuery ? { search: searchQuery } : {}),
      ...newFilters,
    };

    setIsLoading(true);
    router.get(window.route('equipment.index'), updatedFilters, {
      preserveState: true,
      replace: true,
      onFinish: () => setIsLoading(false),
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setIsLoading(true);
    router.get(window.route('equipment.index'), {}, {
      preserveState: true,
      replace: true,
      onFinish: () => setIsLoading(false),
    });
  };

  const getStatusBadge = (status: string) => {
    const label = forceString(t(status), status);
    switch (status.toLowerCase()) {
      case 'available':
        return <Badge variant="default">{label}</Badge>;
      case 'rented':
        return <Badge variant="secondary">{label}</Badge>;
      case 'maintenance':
        return <Badge variant="outline">{label}</Badge>;
      case 'out_of_service':
        return <Badge variant="destructive">{label}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  function renderCategory(category: any): string {
    if (!category) return '—';
    let translated = category;
    if (typeof category === 'string') translated = t(category);
    if (typeof category === 'object') {
      if (category.name) translated = t(category.name);
      else if (category.en) translated = t(category.en);
      else {
        const first = Object.values(category).find(v => typeof v === 'string');
        if (first) translated = t(first);
      }
    }
    if (typeof translated === 'object' && translated !== null) {
      const firstString = Object.values(translated).find(v => typeof v === 'string');
      if (firstString) return firstString;
      return '—';
    }
    if (typeof translated === 'string') return translated;
    return '—';
  }

  // Helper to render any value safely as a string
  function renderValue(val: any): string {
    if (!val) return '—';
    let translated = val;
    if (typeof val === 'string' || typeof val === 'number') translated = String(val);
    if (typeof val === 'object') {
      if (val.name) translated = t(val.name);
      else if (val.en) translated = t(val.en);
      else {
        const first = Object.values(val).find(v => typeof v === 'string' || typeof v === 'number');
        if (first) translated = String(first);
      }
    }
    if (typeof translated === 'object' && translated !== null) {
      const firstString = Object.values(translated).find(v => typeof v === 'string' || typeof v === 'number');
      if (firstString) return String(firstString);
      return '—';
    }
    if (typeof translated === 'string' || typeof translated === 'number') return String(translated);
    return '—';
  }

  // Helper to force string output for any label or value
  function forceString(val: any, fallback: string): string {
    if (!val) return fallback;
    let translated = val;
    if (typeof val === 'string') translated = t(val);
    if (typeof val === 'object') {
      if (val.en && typeof val.en === 'string') translated = t(val.en);
      else {
        const first = Object.values(val).find(v => typeof v === 'string');
        if (first) translated = t(first);
      }
    }
    if (typeof translated === 'object' && translated !== null) {
      const firstString = Object.values(translated).find(v => typeof v === 'string');
      if (firstString) return firstString;
      return fallback;
    }
    if (typeof translated === 'string') return translated;
    return fallback;
  }

  return (
    <AppLayout title={forceString(t('equipment'), 'equipment')} breadcrumbs={breadcrumbs} requiredPermission="equipment.view">
      <Head title={forceString(t('equipment'), 'equipment')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{forceString(t('equipment'), 'equipment')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="grid gap-4 md:grid-cols-4 items-end">
                <div>
                  <Input
                    type="text"
                    placeholder={forceString(t('ph_search_equipment'), 'ph_search_equipment')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={forceString(t('ph_filter_by_category'), 'ph_filter_by_category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{forceString(t('opt_all_categories'), 'opt_all_categories')}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {forceString(t(category), category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder={forceString(t('ph_filter_by_status'), 'ph_filter_by_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{forceString(t('opt_all_statuses'), 'opt_all_statuses')}</SelectItem>
                      {Object.entries(statuses).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {forceString(t(label), label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 justify-between md:justify-end">
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isLoading}>
                      <Search className="mr-2 h-4 w-4" />
                      {forceString(t('search'), 'search')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetFilters}
                      disabled={isLoading}
                    >
                      {forceString(t('clear_filters'), 'clear_filters')}
                    </Button>
                  </div>
                  <CreateButton
                    resourceType="equipment"
                    text={forceString(t('add_equipment'), 'add_equipment')}
                  />
                </div>
              </div>
            </form>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{forceString(t('door_number'), 'door_number')}</TableHead>
                    <TableHead>{forceString(t('equipment_name'), 'equipment_name')}</TableHead>
                    <TableHead>{forceString(t('model'), 'model')}</TableHead>
                    <TableHead>{forceString(t('serial_number'), 'serial_number')}</TableHead>
                    <TableHead>{forceString(t('category'), 'category')}</TableHead>
                    <TableHead>{forceString(t('status'), 'status')}</TableHead>
                    <TableHead>{forceString(t('daily_rate'), 'daily_rate')}</TableHead>
                    <TableHead className="w-[100px] text-right">{forceString(t('actions'), 'actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        {forceString(t('no_equipment_found'), 'no_equipment_found')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    equipment.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{renderValue(item.door_number)}</TableCell>
                        <TableCell>{renderValue(item.name)}</TableCell>
                        <TableCell>{renderValue(item.model)}</TableCell>
                        <TableCell>{renderValue(item.serial_number)}</TableCell>
                        <TableCell>{renderCategory(item.category)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{renderValue(item.daily_rate)}</TableCell>
                        <TableCell className="flex justify-end">
                          <CrudButtons
                            resourceType="equipment"
                            resourceId={item.id}
                            resourceName={forceString(item.name, 'equipment')}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {equipment.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {forceString(t('showing'), 'showing')} {equipment.from} {forceString(t('to'), 'to')} {equipment.to} {forceString(t('of'), 'of')} {equipment.total} {forceString(t('items'), 'items')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyFilters({ page: equipment.current_page - 1 })}
                    disabled={equipment.current_page === 1 || isLoading}
                  >
                    {forceString(t('previous'), 'previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyFilters({ page: equipment.current_page + 1 })}
                    disabled={equipment.current_page === equipment.last_page || isLoading}
                  >
                    {forceString(t('next'), 'next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

















