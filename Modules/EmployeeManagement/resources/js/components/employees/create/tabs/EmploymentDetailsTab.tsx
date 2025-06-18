import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ModalForm from '@/components/shared/ModalForm';
import PositionSelector from '../PositionSelector';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getTranslation } from '@/utils/translation';
// import { User, Position } from '@/types/models';

const positionSchema = z.object({
  name: z.string().min(1, 'Position name is required'),
  description: z.string().optional(),
})

const employmentDetailsSchema = z.object({
  position_id: z.number().nullable(),
  hire_date: z.string().min(1, 'Hire date is required'),
  status: z.enum(['active', 'inactive', 'on_leave']),
  role: z.enum(['admin', 'manager', 'foreman', 'workshop', 'employee']),
  supervisor: z.string().optional(),
  contract_hours_per_day: z.number().min(1, 'Must be at least 1 hour').max(24, 'Cannot exceed 24 hours'),
  contract_days_per_month: z.number().min(1, 'Must be at least 1 day').max(31, 'Cannot exceed 31 days'),
  notes: z.string().optional(),
})

type EmploymentDetailsFormValues = z.infer<typeof employmentDetailsSchema>

interface EmploymentDetailsTabProps {
  form: UseFormReturn<any>;
  positions: any[];
  users: any[];
}

type PositionType = { id: number; name: string; description?: string };

export default function EmploymentDetailsTab({ form, positions, users }: EmploymentDetailsTabProps) {
  const { t } = useTranslation('employee');

  const [positionsState, setPositionsState] = useState<PositionType[]>(positions || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPosition, setNewPosition] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionType | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<PositionType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddPositionClick = () => {
    setShowAddModal(true);
    setEditingPosition(null);
    setNewPosition({ name: '', description: '' });
  };
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPosition(null);
    setNewPosition({ name: '', description: '' });
  };
  const handleAddPositionSubmit = async () => {
    setAdding(true);
    // Uniqueness check (case-insensitive, trim)
    const exists = positionsState.some(
      p => p.name.trim().toLowerCase() === newPosition.name.trim().toLowerCase() && (!editingPosition || p.id !== editingPosition.id)
    );
    if (exists) {
      setAdding(false);
      toast.error('Position name must be unique.');
      return;
    }
    try {
      if (editingPosition) {
        // Edit logic (PUT)
        const res = await axios.put(`/api/v1/positions/${editingPosition.id}`, newPosition, {
          headers: { 'Accept': 'application/json' }
        });
        setPositionsState(prev => prev.map(p => p.id === editingPosition.id ? res.data : p));
        toast.success('Position updated successfully');
      } else {
        // Add logic (POST)
        let newPositionObj = null;
        try {
          const res = await axios.post('/api/v1/positions', newPosition, {
            headers: { 'Accept': 'application/json' }
          });
          newPositionObj = res.data;
        } catch (err: any) {
          // If 401 or error, still try to fetch the list
        }
        try {
          const listRes = await axios.get('/api/v1/positions', {
            headers: { 'Accept': 'application/json' }
          });
          const updatedList = Array.isArray(listRes.data) ? listRes.data : (listRes.data.data || []);
          setPositionsState(updatedList);
          toast.success('Position added successfully');
        } catch (err: any) {
          // If fetch fails, fall back to appending
          if (newPositionObj) {
            setPositionsState(prev => [...prev, newPositionObj]);
            toast.success('Position added successfully');
          } else {
            toast.error('Failed to update position list after add.');
          }
        }
      }
      handleCloseModal();
    } catch (err: any) {
      // Only show error if not a 401 or if the new position is not found after refetch
      if (!(err.response && err.response.status === 401)) {
        toast.error('Failed to save position: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setAdding(false);
    }
  };
  const handleEditPositionClick = () => {
    const pos = positionsState.find(p => p.id.toString() === form.getValues('position_id'));
    if (pos) {
      setEditingPosition(pos);
      setNewPosition({ name: pos.name, description: typeof pos.description === 'string' ? pos.description : '' });
      setShowAddModal(true);
    }
  };
  const handleDeletePositionClick = () => {
    const pos = positionsState.find(p => p.id.toString() === form.getValues('position_id'));
    if (pos) {
      setDeletingPosition(pos);
      setShowDeleteConfirm(true);
    }
  };
  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      if (deletingPosition) {
        await axios.delete(`/api/v1/positions/${deletingPosition.id}`, {
          headers: { 'Accept': 'application/json' }
        });
        setPositionsState(prev => prev.filter(p => p.id !== deletingPosition.id));
        toast.success('Position deleted successfully');
        // Optionally: clear selection if deleted
        if (form.getValues('position_id')?.toString() === deletingPosition.id.toString()) {
          form.setValue('position_id', '', { shouldValidate: true });
        }
      }
    } catch (err: any) {
      toast.error('Failed to delete position: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingPosition(null);
    }
  };
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletingPosition(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('employment_details')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            These fields are optional. You can update them later after creating the employee.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="file_number"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>{t('file_number')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter file number (EMP-XXXX)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position_id"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <div className="flex items-center gap-1">
                    <div className="flex-1">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        defaultValue={''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('ph_select_position')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positionsState.filter(p => p && typeof p.id === 'number' && typeof p.name === 'string').map((position) => (
                            <SelectItem key={position.id} value={position.id.toString()}>
                              {getTranslation(position.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Edit and Delete icons only if a position is selected */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-1"
                      disabled={!field.value}
                      onClick={handleEditPositionClick}
                      title={t('ttl_edit_position')}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-1"
                      disabled={!field.value}
                      onClick={handleDeletePositionClick}
                      title={t('delete_position')}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-1 whitespace-nowrap"
                      onClick={handleAddPositionClick}
                      title={t('ttl_add_position')}
                    >
                      +
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hire_date"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>{t('hire_date')}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('ph_select_status')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">{t('on_leave')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('ph_select_role')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="foreman">Foreman</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supervisor"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Supervisor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('ph_select_supervisor')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract_hours_per_day"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>{t('lbl_contract_hours_per_day')}</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract_days_per_month"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>{t('lbl_contract_days_per_month')}</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="31" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Add/Edit Position Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">{editingPosition ? 'Edit Position' : 'Add New Position'}</h2>
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">{t('lbl_position_name')}</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={newPosition.name}
                    onChange={e => setNewPosition({ ...newPosition, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={newPosition.description}
                    onChange={e => setNewPosition({ ...newPosition, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                  <Button type="button" disabled={adding} onClick={handleAddPositionSubmit}>
                    {adding ? (editingPosition ? 'Saving...' : 'Adding...') : (editingPosition ? 'Save Changes' : 'Add Position')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4 text-red-600">{t('delete_position')}</h2>
              <p className="mb-6">Are you sure you want to delete the position <span className="font-bold">{deletingPosition?.name}</span>?</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={handleDeleteCancel}>Cancel</Button>
                <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

