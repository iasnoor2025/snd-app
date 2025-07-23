import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { toast } from 'sonner';

interface Company {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  logo?: string;
  legal_document?: string;
}

export default function CompanySettings({ company }: { company: Company }) {
  const [legalFile, setLegalFile] = useState<File | null>(null);
  const { data, setData, post, processing, errors } = useForm({
    name: company?.name || '',
    address: company?.address || '',
    email: company?.email || '',
    phone: company?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(e.target.name as keyof typeof data, e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('company-management.settings.update'), {
      onSuccess: () => toast.success('Company info updated'),
      onError: () => toast.error('Failed to update company info'),
    });
  };

  const handleLegalUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalFile) return;
    const formData = new FormData();
    formData.append('legal_document', legalFile);
    window.axios.post(route('company-management.legal.upload'), formData)
      .then(() => toast.success('Legal document uploaded'))
      .catch(() => toast.error('Failed to upload legal document'));
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={data.name} onChange={handleChange} error={errors.name} required />
          <Input label="Address" name="address" value={data.address} onChange={handleChange} error={errors.address} />
          <Input label="Email" name="email" value={data.email} onChange={handleChange} error={errors.email} />
          <Input label="Phone" name="phone" value={data.phone} onChange={handleChange} error={errors.phone} />
          <Button type="submit" disabled={processing}>Save</Button>
        </form>
        <hr className="my-6" />
        <form onSubmit={handleLegalUpload} className="space-y-4">
          <label className="block font-medium">Legal Document</label>
          <Input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e => setLegalFile(e.target.files?.[0] || null)} />
          <Button type="submit">Upload Legal Document</Button>
          {company.legal_document && (
            <a href={route('company-management.legal.download')} className="ml-4 underline text-blue-600" target="_blank" rel="noopener noreferrer">Download Current Legal Document</a>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
