import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Department } from '../../types/employee';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { getTranslation } from "@/utils/translation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Badge } from '../ui/badge';
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash,
  Users,
  AlertCircle
} from 'lucide-react';
import useLoadingState from '../../hooks/useLoadingState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface DepartmentListProps {
  initialDepartments?: Department[];
}

export const DepartmentList: React.FC<DepartmentListProps> = ({ initialDepartments = [] }) => {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(initialDepartments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { isLoading, error, withLoading } = useLoadingState('departmentList');

  // Form state for create/edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Partial<Department>>({})
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (initialDepartments.length === 0) {
      fetchDepartments();
    }
  }, [initialDepartments]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, departments]);

  const fetchDepartments = async () => {
    await withLoading(async () => {
      const response = await axios.get('/api/departments');
      setDepartments(response.data.data);
      setFilteredDepartments(response.data.data);
    })
  };

  const applyFilters = () => {
  const { t } = useTranslation('employee');

    let filtered = [...departments];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        dept =>
          dept.name.toLowerCase().includes(query) ||
          (dept.code && dept.code.toLowerCase().includes(query)) ||
          (dept.description && dept.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(dept => dept.is_active === isActive);
    }

    setFilteredDepartments(filtered);
  };

  const handleCreateDepartment = () => {
    setIsEditMode(false);
    setCurrentDepartment({
      name: '',
      code: '',
      description: '',
      is_active: true
    })
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setIsEditMode(true);
    setCurrentDepartment({
      ...department
    })
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleDeleteDepartment = (departmentId: number) => {
    setDepartmentToDelete(departmentId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDepartment = async () => {
    if (departmentToDelete) {
      try {
        await axios.delete(`/api/departments/${departmentToDelete}`);
        setDepartments(departments.filter(dept => dept.id !== departmentToDelete));
        setShowDeleteConfirm(false);
        setDepartmentToDelete(null);
      } catch (error: any) {
        setFormError(error.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (isEditMode && currentDepartment.id) {
        // Update existing department
        const response = await axios.put(`/api/departments/${currentDepartment.id}`, currentDepartment);

        setDepartments(
          departments.map(dept =>
            dept.id === currentDepartment.id ? response.data.data : dept
          )
        );
      } else {
        // Create new department
        const response = await axios.post('/api/departments', currentDepartment);
        setDepartments([...departments, response.data.data]);
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      setFormError(
        error.response?.data?.message ||
        'An error occurred while saving the department'
      );
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Departments</CardTitle>
          <Button className="flex items-center gap-1" onClick={handleCreateDepartment}>
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder={t('ph_search_departments')}
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t('ph_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('opt_all_status')}</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading departments...
                  </TableCell>
                </TableRow>
              ) : filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{getTranslation(department.name)}</TableCell>
                    <TableCell>{department.code || '-'}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {department.description || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{department.manager ? `${department.manager.first_name} ${department.manager.last_name}` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(department.is_active)}>
                        {department.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditDepartment(department)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteDepartment(department.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            View Employees
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Create/Edit Department Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Department' : 'Create Department'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update department details below'
                : 'Fill in the details below to create a new department'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit}>
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('lbl_department_name')} <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={currentDepartment.name || ''}
                  onChange={(e) => setCurrentDepartment({...currentDepartment, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">{t('lbl_department_code')}</Label>
                <Input
                  id="code"
                  value={currentDepartment.code || ''}
                  onChange={(e) => setCurrentDepartment({...currentDepartment, code: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={currentDepartment.description || ''}
                  onChange={(e) => setCurrentDepartment({...currentDepartment, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <Select
                  value={currentDepartment.is_active === false ? 'inactive' : 'active'}
                  onValueChange={(value) => setCurrentDepartment({
                    ...currentDepartment,
                    is_active: value === 'active'
                  })}
                  <SelectTrigger id="is_active">
                    <SelectValue placeholder={t('ph_select_status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="submit">
                {isEditMode ? 'Update Department' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ttl_delete_department')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this department? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteDepartment}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DepartmentList;
















