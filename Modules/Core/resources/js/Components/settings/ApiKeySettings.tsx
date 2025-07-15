import { formatDateTime } from '@/Core/utils/dateFormatter';
import { useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    MultiSelect,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui';

interface ApiKey {
    id: string;
    name: string;
    last_used_at: string | null;
    created_at: string;
}

interface ApiKeySettingsProps {
    initialKeys: ApiKey[];
}

const AVAILABLE_SCOPES = [
    { label: 'All Access', value: '*' },
    { label: 'Read Equipment', value: 'equipment:read' },
    { label: 'Write Equipment', value: 'equipment:write' },
    { label: 'Read Rentals', value: 'rentals:read' },
    { label: 'Write Rentals', value: 'rentals:write' },
    { label: 'Read Employees', value: 'employees:read' },
    { label: 'Write Employees', value: 'employees:write' },
];

export default function ApiKeySettings({ initialKeys }: ApiKeySettingsProps) {
    const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newKeyData, setNewKeyData] = useState({
        name: '',
        scopes: ['*'],
        expiresAt: '',
    });
    const [createdKey, setCreatedKey] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newKeyData.name) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newKeyData),
            });
            const data = await response.json();

            if (data.data) {
                setKeys([data.data, ...keys]);
                setCreatedKey(data.data.key);
                toast.success('API key created successfully');
            }
        } catch (error) {
            toast.error('Failed to create API key');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevoke = async (id: string) => {
        setIsLoading(true);
        try {
            await fetch(`/api/api-keys/${id}`, {
                method: 'DELETE',
            });
            setKeys(keys.filter((key) => key.id !== id));
            toast.success('API key revoked successfully');
        } catch (error) {
            toast.error('Failed to revoke API key');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setShowCreateDialog(false);
        setNewKeyData({
            name: '',
            scopes: ['*'],
            expiresAt: '',
        });
        setCreatedKey(null);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage API keys for accessing the application programmatically</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button>Create API Key</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <div>
                                    <DialogTitle>{createdKey ? 'API Key Created' : 'Create API Key'}</DialogTitle>
                                    <DialogDescription>
                                        {createdKey
                                            ? "Copy your API key now. You won't be able to see it again!"
                                            : 'Create a new API key to access the API'}
                                    </DialogDescription>
                                </div>

                                {createdKey ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>API Key</Label>
                                            <Input value={createdKey} readOnly onClick={(e) => e.currentTarget.select()} />
                                            <p className="text-sm text-muted-foreground">
                                                Make sure to copy this key now. You won't be able to see it again!
                                            </p>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button onClick={handleCloseDialog}>Done</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                value={newKeyData.name}
                                                onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                                                placeholder="Enter a name for this API key"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Scopes</Label>
                                            <MultiSelect
                                                options={AVAILABLE_SCOPES}
                                                value={newKeyData.scopes}
                                                onChange={(value) => setNewKeyData({ ...newKeyData, scopes: value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Expires At</Label>
                                            <Input
                                                type="datetime-local"
                                                value={newKeyData.expiresAt}
                                                onChange={(e) =>
                                                    setNewKeyData({
                                                        ...newKeyData,
                                                        expiresAt: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button onClick={handleCreate} disabled={!newKeyData.name || isLoading}>
                                                {isLoading ? 'Creating...' : 'Create'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell>{key.name}</TableCell>
                                    <TableCell>{key.last_used_at || 'Never'}</TableCell>
                                    <TableCell>{formatDateTime(key.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="sm" onClick={() => handleRevoke(key.id)} disabled={isLoading}>
                                            Revoke
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {keys.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No API keys found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
