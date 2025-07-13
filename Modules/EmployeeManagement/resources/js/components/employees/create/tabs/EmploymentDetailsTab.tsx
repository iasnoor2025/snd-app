import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Input } from "@/Core";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/Core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Core";
import { Button } from "@/Core";
import { Plus, Pencil, Trash } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PositionSelector from '../../create/PositionSelector';
import { Alert, AlertTitle, AlertDescription } from "@/Core";
import { Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getTranslation } from "@/Core";
// import { User, Position } from '@/Core/types/models';

const positionSchema = z.object({
  name: z.string().min(1, 'Position name is required'),
  description: z.string().optional(),
})

const employmentDetailsSchema = z.object({
  position_id: z.number().nullable(),
  department_id: z.number().min(1, 'Department is required'),
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

type PositionType = {
  id: number;
  name: string | { [key: string]: string };
  description?: string | { [key: string]: string };
  active?: boolean;
};

export default function EmploymentDetailsTab({ form, positions, users }: EmploymentDetailsTabProps) {
  const { t } = useTranslation('employee');

  // Initialize with default positions if none provided
  const defaultPositions = [
    { id: 1, name: 'Manager', description: 'Management position', active: true },
    { id: 2, name: 'Supervisor', description: 'Supervisory position', active: true },
    { id: 3, name: 'Operator', description: 'Equipment operator', active: true },
    { id: 4, name: 'Driver', description: 'Vehicle driver', active: true },
    { id: 5, name: 'Technician', description: 'Technical support', active: true },
    { id: 6, name: 'Administrator', description: 'Administrative role', active: true },
    { id: 7, name: 'Clerk', description: 'Clerical position', active: true },
    { id: 8, name: 'Accountant', description: 'Accounting position', active: true },
    { id: 9, name: 'Engineer', description: 'Engineering position', active: true },
    { id: 10, name: 'Mechanic', description: 'Mechanical repair', active: true }
  ];

  const [positionsState, setPositionsState] = useState<PositionType[]>(
    positions && positions.length > 0 ? positions : defaultPositions
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPosition, setNewPosition] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionType | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<PositionType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/departments?is_active=true')
      .then(res => {
        setDepartments(res.data.data || []);
      })
      .catch(err => {
        setDepartments([]);
        toast.error('Could not load departments.');
      });
  }, []);

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

    // Validate input
    if (!newPosition.name.trim()) {
      setAdding(false);
      toast.error('Position name is required');
      return;
    }

    // Uniqueness check (case-insensitive, trim)
    const exists = positionsState.some(
      (p: any) => {
        // Handle translatable names (objects with language keys)
        const posName = typeof p.name === 'object' ? (p.name.en || Object.values(p.name)[0]) : p.name;
        const newName = newPosition.name.trim().toLowerCase();
        return posName.toString().trim().toLowerCase() === newName &&
                (!editingPosition || p.id !== editingPosition.id);
      }
    );

    if (exists) {
      setAdding(false);
      toast.error('Position name must be unique.');
      return;
    }

    try {
      if (editingPosition) {
        // Edit logic - use public API
        const response = await axios.put(`/public-api/positions/${editingPosition.id}`, {
          name: newPosition.name,
          description: newPosition.description,
          is_active: true
        });

        console.log('Position update response:', response.data);

        // Update in local state
        if (response.data) {
          setPositionsState(prev =>
            prev.map((p: any) => p.id === editingPosition.id ? response.data : p)
          );
          toast.success('Position updated successfully');
        } else {
          // Fallback to local update
          const updatedPosition = {
            ...editingPosition,
            name: newPosition.name,
            description: newPosition.description
          };

          setPositionsState(prev =>
            prev.map((p: any) => p.id === editingPosition.id ? updatedPosition : p)
          );
          toast.success('Position updated successfully');
        }
      } else {
        // Add logic - use public API
        const response = await axios.post('/public-api/positions', {
          name: newPosition.name,
          description: newPosition.description,
          is_active: true
        });

        console.log('Position creation response:', response.data);

        // Add to local state
        if (response.data && response.data.id) {
          setPositionsState(prev => [...prev, response.data]);
          toast.success('Position added successfully');
        } else if (response.data && response.data.data && response.data.data.id) {
          // Handle nested data structure
          setPositionsState(prev => [...prev, response.data.data]);
          toast.success('Position added successfully');
        } else {
          // Fallback to local creation
          const newPositionObj = {
            id: Math.floor(Math.random() * 1000) + 100,
            name: newPosition.name,
            description: newPosition.description,
            active: true
          };

          setPositionsState(prev => [...prev, newPositionObj]);
          toast.success('Position added successfully');
        }
      }

      // Fetch updated positions list
      try {
        const response = await axios.get('/api/positions');
        if (response.data && Array.isArray(response.data)) {
          setPositionsState(response.data);
        }
      } catch (fetchError) {
        console.error('Error refreshing positions:', fetchError);
      }

      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving position:', err);

      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        Object.values(errors).forEach((messages: any) => {
          if (Array.isArray(messages)) {
            messages.forEach((message: string) => toast.error(message));
          }
        });
      } else {
        toast.error('Error: ' + err.message);
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
        // Delete via public API
        await axios.delete(`/public-api/positions/${deletingPosition.id}`);

        // Remove from local state
        setPositionsState(prev => prev.filter((p: any) => p.id !== deletingPosition.id));
        toast.success('Position deleted successfully');

        // Clear selection if deleted
        if (form.getValues('position_id')?.toString() === deletingPosition.id.toString()) {
          form.setValue('position_id', '', { shouldValidate: true });
        }

        // Fetch updated positions list
        try {
          const response = await axios.get('/public-api/positions');
          if (response.data && Array.isArray(response.data)) {
            setPositionsState(response.data);
          }
        } catch (fetchError) {
          console.error('Error refreshing positions:', fetchError);
        }
      }
    } catch (err: any) {
      console.error('Error deleting position:', err);

      // Even if API call fails, remove from local state for better UX
      if (deletingPosition) {
        setPositionsState(prev => prev.filter((p: any) => p.id !== deletingPosition.id));

        // Clear selection if deleted
        if (form.getValues('position_id')?.toString() === deletingPosition.id.toString()) {
          form.setValue('position_id', '', { shouldValidate: true });
        }
      }

      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Error: ' + err.message);
      }
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
          <AlertTitle>{t('information')}</AlertTitle>
          <AlertDescription>{t('employment_optional_info')}</AlertDescription>
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
                  <FormLabel>{t('position')}</FormLabel>
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
                          {/* Always show the current value if not in the list */}
                          {field.value && !positionsState.some(p => String(p.id) === String(field.value)) && (
                            <SelectItem key={field.value} value={field.value}>
                              {form.getValues('position')?.name || field.value}
                            </SelectItem>
                          )}
                          {positionsState.filter(p => p && typeof p.id === 'number').map((position) => (
                            <SelectItem key={position.id} value={String(position.id)}>
                              {typeof position.name === 'object'
                                ? (position.name.en || Object.values(position.name)[0])
                                : position.name}
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
                  <FormLabel>{t('status')}</FormLabel>
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
                  <FormLabel>{t('role')}</FormLabel>
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
                  <FormLabel>{t('supervisor')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('ph_select_supervisor')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Always show the current value if not in the list */}
                      {field.value && !users.some(u => String(u.id) === String(field.value)) && (
                        <SelectItem key={field.value} value={field.value}>
                          {form.getValues('supervisor_name') || field.value}
                        </SelectItem>
                      )}
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
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
                  <FormLabel>{t('contract_hours_per_day')}</FormLabel>
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
                  <FormLabel>{t('contract_days_per_month')}</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="31" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('department')}</FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : ''}
                    onValueChange={value => field.onChange(Number(value))}
                    disabled={departments.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger id="department_id">
                        <SelectValue placeholder={t('ph_select_department')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.length === 0 ? (
                        <SelectItem value="0" disabled>
                          {t('No departments found')}
                        </SelectItem>
                      ) : (
                        departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {getTranslation(dept.name)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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

















