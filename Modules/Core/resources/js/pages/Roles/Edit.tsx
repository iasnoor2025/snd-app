import React, { useEffect, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from '../../../../../../resources/js/components/ui/button';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/AdminLayout';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface Props {
  role: Role;
  permissions: Record<string, Permission[]>;
  selectedPermissions?: number[];
  success?: string;
  error?: string;
}

const EditRole: React.FC<Props> = ({ role, permissions, selectedPermissions, success, error }) => {
  const { data, setData, put, processing, errors } = useForm({
    name: role.name,
    permissions: role.permissions.map(p => p.id),
  });
  const page = usePage();

  useEffect(() => {
    if (page.props.success) toast.success(page.props.success as string);
    if (page.props.error) toast.error(page.props.error as string);
  }, [page.props.success, page.props.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('roles.update', role.id));
  };

  const handlePermissionChange = (id: number) => {
    setData('permissions', data.permissions.includes(id)
      ? data.permissions.filter((pid: number) => pid !== id)
      : [...data.permissions, id]
    );
  };

  return (
    <AdminLayout title="Edit Role">
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Edit Role</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="role-name" className="block mb-2 font-medium text-lg">Role Name</label>
            <input
              id="role-name"
              className="w-full border rounded px-3 py-2 text-lg focus:outline-none focus:ring focus:border-blue-300"
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              placeholder="Role Name"
              required
            />
            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block mb-4 font-medium text-lg">Permissions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(permissions).map(([section, perms]) => {
                // Get all permission IDs for this section
                const sectionPermissionIds = perms.map(p => p.id);
                // Check if all are selected
                const allSelected = sectionPermissionIds.every(id => data.permissions.includes(id));
                // Check if none are selected
                const noneSelected = sectionPermissionIds.every(id => !data.permissions.includes(id));
                // Handlers
                const handleSelectAll = () => {
                  setData('permissions', Array.from(new Set([...data.permissions, ...sectionPermissionIds])));
                };
                const handleDeselectAll = () => {
                  setData('permissions', data.permissions.filter((id: number) => !sectionPermissionIds.includes(id)));
                };
                return (
                  <div key={section} className="mb-6">
                    <div className="font-semibold capitalize mb-3 text-blue-700 text-base border-b pb-1 flex items-center gap-4">
                      {section.replace('-', ' ')}
                      <label className="flex items-center gap-1 text-sm font-normal">
                        <input
                          type="checkbox"
                          ref={el => {
                            if (el) el.indeterminate = !(allSelected || noneSelected);
                          }}
                          checked={allSelected && !noneSelected}
                          onChange={e => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                          className="accent-blue-600 w-4 h-4"
                        />
                        Select All
                      </label>
                    </div>
                    <div className="flex flex-col gap-2">
                      {perms.map(permission => (
                        <label key={permission.id} className="flex items-center gap-2 text-base">
                          <input
                            type="checkbox"
                            checked={data.permissions.includes(permission.id)}
                            onChange={() => handlePermissionChange(permission.id)}
                            className="accent-blue-600 w-4 h-4"
                          />
                          {permission.name}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.permissions && <div className="text-red-500 text-sm mt-1">{errors.permissions}</div>}
          </div>
          <div className="sticky bottom-0 bg-white py-4 border-t flex justify-end">
            <Button type="submit" disabled={processing} className="px-8 py-2 text-lg">Update</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditRole;
