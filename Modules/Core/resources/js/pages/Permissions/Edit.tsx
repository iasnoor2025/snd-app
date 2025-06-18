import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../resources/js/components/ui/card';
import { Input } from '../../../../../../resources/js/components/ui/input';
import { Button } from '../../../../../../resources/js/components/ui/button';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Permission {
  id: number;
  name: string;
}

interface Props {
  permission: Permission;
  success?: string;
  error?: string;
}

const EditPermission: React.FC<Props> = ({ permission, success, error }) => {
  const { data, setData, put, processing, errors } = useForm({
    name: permission.name,
  });
  const page = usePage();

  useEffect(() => {
    if (page.props.success) toast.success(page.props.success as string);
    if (page.props.error) toast.error(page.props.error as string);
  }, [page.props.success, page.props.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('permissions.update', permission.id));
  };

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Permission</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              placeholder="Permission Name"
              required
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
          </div>
          <Button type="submit" disabled={processing} className="w-full">Update</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditPermission;
