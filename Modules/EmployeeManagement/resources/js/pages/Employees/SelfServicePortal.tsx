import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Button } from '@/../../Modules/Core/resources/js/components/ui/button';
import { Input } from '@/../../Modules/Core/resources/js/components/ui/input';
import { toast } from 'sonner';
import { SkillsMatrix } from '../components/employees/SkillsMatrix';
import { PerformanceReviewList } from '../components/employees/PerformanceReviewList';

export default function SelfServicePortal() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch('/api/employees/me');
    const data = await res.json();
    setProfile(data.data);
    setForm(data.data);
    setEmployeeId(data.data.id);
  };

  const handleUpdateProfile = async () => {
    try {
      await fetch('/api/employees/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      toast.success('Profile updated');
      setIsEditing(false);
      fetchProfile();
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (!profile || !employeeId) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
                placeholder="First Name"
              />
              <Input
                value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
                placeholder="Last Name"
              />
              <Input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
              />
              <Button onClick={handleUpdateProfile}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div><b>Name:</b> {profile.first_name} {profile.last_name}</div>
              <div><b>Email:</b> {profile.email}</div>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SkillsMatrix employeeId={employeeId} />
      <PerformanceReviewList employeeId={employeeId} />
      {/* Timesheets and leave requests can be added here as additional cards/components */}
    </div>
  );
}
