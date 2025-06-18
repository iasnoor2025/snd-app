import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../resources/js/components/ui/card';
import { Input } from '../../../../../../resources/js/components/ui/input';
import { Button } from '../../../../../../resources/js/components/ui/button';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

const CreatePermission: React.FC = () => {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
  });
  const page = usePage();

  useEffect(() => {
    if (page.props.success) toast.success(page.props.success as string);
    if (page.props.error) toast.error(page.props.error as string);
  }, [page.props.success, page.props.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('permissions.store'));
  };

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create Permission</CardTitle>
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
          <Button type="submit" disabled={processing} className="w-full">Create</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePermission;
