import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@/Core/components/ui';





interface SettingField {
    value: string | number | boolean;
    type: string;
    description: string;
    is_public: boolean;
    updated_at: string;
}

interface SettingsCategory {
    [key: string]: SettingField;
}

interface Settings {
    [category: string]: SettingsCategory;
}

export default function SystemSettings({ isAdmin }: { isAdmin?: boolean }) {
    const [settings, setSettings] = useState<Settings>({});
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Settings>({});
    const [backups, setBackups] = useState<any[]>([]);
    const [backupLoading, setBackupLoading] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [backupFile, setBackupFile] = useState<File | null>(null);

    useEffect(() => {
        fetchSettings();
        if (isAdmin) fetchBackups();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/system-settings');
            const data = await res.json();
            setSettings(data.settings);
            setForm(data.settings);
        } catch (e) {
            toast.error('Failed to load system settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (category: string, key: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: {
                    ...prev[category][key],
                    value,
                },
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload: any = {};
            Object.keys(form).forEach((cat) => {
                payload[cat] = {};
                Object.keys(form[cat]).forEach((key) => {
                    payload[cat][key] = form[cat][key].value;
                });
            });
            const res = await fetch('/system-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                toast.success('Settings updated successfully');
                fetchSettings();
            } else {
                toast.error('Failed to update settings');
            }
        } catch (e) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    // Backup & Restore logic
    const fetchBackups = async () => {
        setBackupLoading(true);
        try {
            const res = await fetch('/system/backup');
            const data = await res.json();
            setBackups(data.backups || []);
        } catch (e) {
            toast.error('Failed to load backups');
        } finally {
            setBackupLoading(false);
        }
    };

    const triggerBackup = async () => {
        setBackupLoading(true);
        try {
            const res = await fetch('/system/backup', { method: 'POST' });
            if (res.ok) {
                toast.success('Backup created');
                fetchBackups();
            } else {
                toast.error('Backup failed');
            }
        } catch (e) {
            toast.error('Backup failed');
        } finally {
            setBackupLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!backupFile) return;
        setRestoreLoading(true);
        const formData = new FormData();
        formData.append('backup', backupFile);
        try {
            const res = await fetch('/system/backup/restore', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                toast.success('Database restored');
            } else {
                toast.error('Restore failed');
            }
        } catch (e) {
            toast.error('Restore failed');
        } finally {
            setRestoreLoading(false);
        }
    };

    const handleDeleteBackup = async (filename: string) => {
        if (!window.confirm('Delete this backup?')) return;
        try {
            const res = await fetch(`/system/backup/${filename}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Backup deleted');
                fetchBackups();
            } else {
                toast.error('Delete failed');
            }
        } catch (e) {
            toast.error('Delete failed');
        }
    };

    if (loading) return <div>Loading system settings...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Manage global configuration for the application</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList>
                        {Object.keys(settings).map((cat) => (
                            <TabsTrigger key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </TabsTrigger>
                        ))}
                        {isAdmin && <TabsTrigger value="backup">Backup & Restore</TabsTrigger>}
                    </TabsList>
                    {Object.keys(settings).map((cat) => (
                        <TabsContent key={cat} value={cat}>
                            <div className="space-y-6">
                                {Object.entries(form[cat] || {}).map(([key, field]) => (
                                    <div key={key} className="flex flex-col gap-1">
                                        <label className="font-medium">{key.replace(/_/g, ' ')}</label>
                                        <Input
                                            value={field.value as string}
                                            onChange={(e) => handleInputChange(cat, key, e.target.value)}
                                            disabled={saving}
                                        />
                                        <span className="text-xs text-muted-foreground">{field.description}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                    {isAdmin && (
                        <TabsContent value="backup">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Button onClick={triggerBackup} disabled={backupLoading}>
                                        {backupLoading ? 'Backing up...' : 'Create Backup'}
                                    </Button>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <Upload size={16} />
                                        <input
                                            type="file"
                                            accept=".sql"
                                            className="hidden"
                                            onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                                        />
                                        <span>Restore from file</span>
                                    </label>
                                    <Button onClick={handleRestore} disabled={!backupFile || restoreLoading}>
                                        {restoreLoading ? 'Restoring...' : 'Restore'}
                                    </Button>
                                </div>
                                <div>
                                    <h4 className="mb-2 font-semibold">Available Backups</h4>
                                    {backupLoading ? (
                                        <div>Loading backups...</div>
                                    ) : (
                                        <ul className="divide-y">
                                            {backups.map((b) => (
                                                <li key={b.name} className="flex items-center justify-between py-2">
                                                    <span>{b.name}</span>
                                                    <span className="text-xs text-muted-foreground">{new Date(b.created_at * 1000)}</span>
                                                    <a
                                                        href={`/system/backup/download/${b.name}`}
                                                        className="ml-4 text-blue-600 hover:underline"
                                                        download
                                                    >
                                                        Download
                                                    </a>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteBackup(b.name)}>
                                                        Delete
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
                <div className="mt-8 flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
