import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApiKey {
    id: number;
    name: string;
    scopes: string[];
    expires_at: string | null;
    last_used_at: string | null;
    created_at: string;
}

interface ApiKeyManagerProps {
    apiKeys: ApiKey[];
}

export default function ApiKeyManager({ apiKeys: initialApiKeys }: ApiKeyManagerProps) {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
    const [newKeyValue, setNewKeyValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        scopes: [] as string[],
        expires_in: '30' // days
    });

    const availableScopes = [
        { value: 'read', label: 'Read Access' },
        { value: 'write', label: 'Write Access' },
        { value: 'admin', label: 'Admin Access' }
    ];

    const handleCreateKey = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                setApiKeys([...apiKeys, data.key]);
                setNewKeyValue(data.value);
                setShowCreateDialog(false);
                setShowNewKeyDialog(true);
                toast.success('API key created successfully');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error('Failed to create API key');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevokeKey = async (keyId: number) => {
        try {
            const response = await fetch(`/api/api-keys/${keyId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setApiKeys(apiKeys.filter(key => key.id !== keyId));
                toast.success('API key revoked successfully');
            } else {
                throw new Error('Failed to revoke key');
            }
        } catch (error) {
            toast.error('Failed to revoke API key');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                    Manage API keys for programmatic access to your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Button onClick={() => setShowCreateDialog(true)}>
                        Create New API Key
                    </Button>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Scopes</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apiKeys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell>{key.name}</TableCell>
                                    <TableCell>{key.scopes.join(', ')}</TableCell>
                                    <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}
                                    </TableCell>
                                    <TableCell>
                                        {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRevokeKey(key.id)}
                                        >
                                            Revoke
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New API Key</DialogTitle>
                        <DialogDescription>
                            Create a new API key with specific permissions and expiration.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Key name"
                            />
                        </div>

                        <div>
                            <Label>Scopes</Label>
                            <Select
                                value={formData.scopes.join(',')}
                                onValueChange={(value) => setFormData({ ...formData, scopes: value.split(',') })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select permissions" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableScopes.map((scope) => (
                                        <SelectItem key={scope.value} value={scope.value}>
                                            {scope.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Expires In (Days)</Label>
                            <Select
                                value={formData.expires_in}
                                onValueChange={(value) => setFormData({ ...formData, expires_in: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 days</SelectItem>
                                    <SelectItem value="30">30 days</SelectItem>
                                    <SelectItem value="90">90 days</SelectItem>
                                    <SelectItem value="365">1 year</SelectItem>
                                    <SelectItem value="0">Never</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleCreateKey}
                            disabled={isSubmitting || !formData.name || formData.scopes.length === 0}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Key'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>API Key Created</DialogTitle>
                        <DialogDescription>
                            Copy your API key now. You won't be able to see it again!
                        </DialogDescription>
                    </DialogHeader>

                    <Alert>
                        <AlertDescription>
                            <div className="font-mono break-all">
                                {newKeyValue}
                            </div>
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(newKeyValue);
                                toast.success('API key copied to clipboard');
                            }}
                        >
                            Copy to Clipboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 