import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Key,
    Plus,
    Copy,
    Trash2,
    ArrowLeft,
    Calendar,
    Shield,
    Activity,
    AlertTriangle,
    CheckCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/auth-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApiToken {
    id: number;
    name: string;
    abilities: string[];
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
}

interface Props {
    tokens: ApiToken[];
    auth: {
        user: any;
    };
    flash?: {
        token?: string;
        message?: string;
    };
}

const ApiTokensIndex: React.FC<Props> = ({ tokens, auth, flash }) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newTokenName, setNewTokenName] = useState('');
    const [selectedAbilities, setSelectedAbilities] = useState<string[]>(['*']);
    const [expiresIn, setExpiresIn] = useState('1440'); // 24 hours
    const [showNewToken, setShowNewToken] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableAbilities = [
        { value: '*', label: 'Full Access', description: 'Complete access to all API endpoints' },
        { value: 'employees:read', label: 'Read Employees', description: 'View employee information' },
        { value: 'employees:write', label: 'Write Employees', description: 'Create and update employees' },
        { value: 'leaves:read', label: 'Read Leaves', description: 'View leave requests' },
        { value: 'leaves:write', label: 'Write Leaves', description: 'Create and manage leave requests' },
        { value: 'timesheets:read', label: 'Read Timesheets', description: 'View timesheet data' },
        { value: 'timesheets:write', label: 'Write Timesheets', description: 'Create and update timesheets' },
        { value: 'payroll:read', label: 'Read Payroll', description: 'View payroll information' },
        { value: 'payroll:write', label: 'Write Payroll', description: 'Manage payroll data' }
    ];

    const expirationOptions = [
        { value: '60', label: '1 Hour' },
        { value: '480', label: '8 Hours' },
        { value: '1440', label: '1 Day' },
        { value: '10080', label: '1 Week' },
        { value: '43200', label: '1 Month' },
        { value: '0', label: 'Never' }
    ];

    const handleCreateToken = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = {
            name: newTokenName,
            abilities: selectedAbilities,
            expires_in_minutes: expiresIn === '0' ? null : parseInt(expiresIn)
        };

        router.post('/api/tokens', formData, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                setNewTokenName('');
                setSelectedAbilities(['*']);
                setExpiresIn('1440');
                setShowNewToken(true);
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    const handleDeleteToken = (tokenId: number) => {
        router.delete(`/api/tokens/${tokenId}`);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isTokenExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    const getTokenStatus = (token: ApiToken) => {
        if (isTokenExpired(token.expires_at)) {
            return { status: 'expired', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
        }
        if (token.last_used_at) {
            return { status: 'active', color: 'bg-green-100 text-green-800', icon: CheckCircle };
        }
        return { status: 'unused', color: 'bg-yellow-100 text-yellow-800', icon: Activity };
    };

    const handleAbilityChange = (ability: string, checked: boolean) => {
        if (ability === '*') {
            setSelectedAbilities(checked ? ['*'] : []);
        } else {
            if (checked) {
                setSelectedAbilities(prev => {
                    const newAbilities = prev.filter(a => a !== '*');
                    return [...newAbilities, ability];
                });
            } else {
                setSelectedAbilities(prev => prev.filter(a => a !== ability));
            }
        }
    };

    return (
        <AuthenticatedLayout title="API Tokens" description="Manage your API tokens for secure access">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <Link href="/api">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to API
                        </Button>
                    </Link>
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            API Tokens
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage your API tokens for secure access
                        </p>
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Token
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleCreateToken}>
                            <DialogHeader>
                                <DialogTitle>Create API Token</DialogTitle>
                                <DialogDescription>
                                    Create a new API token with specific permissions and expiration.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="token-name">Token Name</Label>
                                    <Input
                                        id="token-name"
                                        placeholder="e.g., Mobile App, Integration Service"
                                        value={newTokenName}
                                        onChange={(e) => setNewTokenName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Permissions</Label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {availableAbilities.map((ability) => (
                                            <div key={ability.value} className="flex items-start space-x-2">
                                                <Checkbox
                                                    id={ability.value}
                                                    checked={selectedAbilities.includes(ability.value)}
                                                    onCheckedChange={(checked) =>
                                                        handleAbilityChange(ability.value, checked as boolean)
                                                    }
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label
                                                        htmlFor={ability.value}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {ability.label}
                                                    </label>
                                                    <p className="text-xs text-muted-foreground">
                                                        {ability.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expires-in">Expires In</Label>
                                    <Select value={expiresIn} onValueChange={setExpiresIn}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expirationOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting || !newTokenName.trim()}>
                                    {isSubmitting ? 'Creating...' : 'Create Token'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Head title="API Tokens" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* New Token Alert */}
                    {flash?.token && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <div className="space-y-2">
                                    <p className="font-medium">Token created successfully!</p>
                                    <p className="text-sm">Please copy your token now. You won't be able to see it again.</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Input
                                            type={showNewToken ? 'text' : 'password'}
                                            value={flash.token}
                                            readOnly
                                            className="font-mono text-sm"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowNewToken(!showNewToken)}
                                        >
                                            {showNewToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(flash.token!)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Flash Message */}
                    {flash?.message && !flash?.token && (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    )}

                    {/* Tokens List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Key className="w-5 h-5 mr-2" />
                                Your API Tokens
                            </CardTitle>
                            <CardDescription>
                                Manage your API tokens. Keep them secure and don't share them.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tokens.length === 0 ? (
                                <div className="text-center py-12">
                                    <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No API tokens yet
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Create your first API token to start using the API.
                                    </p>
                                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Your First Token
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tokens.map((token) => {
                                        const tokenStatus = getTokenStatus(token);
                                        const StatusIcon = tokenStatus.icon;

                                        return (
                                            <div key={token.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Key className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {token.name}
                                                            </h4>
                                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                                <span className="flex items-center">
                                                                    <Calendar className="w-4 h-4 mr-1" />
                                                                    Created {formatDate(token.created_at)}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <Activity className="w-4 h-4 mr-1" />
                                                                    Last used {formatDate(token.last_used_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <Badge className={tokenStatus.color}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {tokenStatus.status}
                                                        </Badge>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Delete API Token</DialogTitle>
                                                                    <DialogDescription>
                                                                        Are you sure you want to delete the token "{token.name}"?
                                                                        This action cannot be undone and will immediately revoke access.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <DialogFooter>
                                                                    <Button variant="outline">Cancel</Button>
                                                                    <Button
                                                                        onClick={() => handleDeleteToken(token.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete Token
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-sm text-gray-600">Permissions: </span>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {token.abilities.map((ability, index) => (
                                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                                        {ability === '*' ? 'Full Access' : ability}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm text-gray-600">Expires: </span>
                                                            <span className={`text-sm font-medium ${
                                                                isTokenExpired(token.expires_at) ? 'text-red-600' : 'text-gray-900'
                                                            }`}>
                                                                {formatDate(token.expires_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Security Notice */}
                    <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Security Notice:</strong> Keep your API tokens secure. Don't share them in publicly accessible areas
                            such as GitHub, client-side code, or any other public forums. If you believe a token has been compromised,
                            revoke it immediately and create a new one.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ApiTokensIndex;
