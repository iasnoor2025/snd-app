import { useState, useEffect } from 'react';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Core/components/ui/dialog';
import { toast } from 'sonner';
import { AlertCircle, Laptop, Smartphone, Tablet, Globe, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DeviceSession {
    name: string;
    type: string;
    browser: string;
    platform: string;
    location: string | null;
    last_active: string;
    is_current: boolean;
}

export function DeviceSessions() {
    const [sessions, setSessions] = useState<DeviceSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/sessions');
            const data = await response.json();
            setSessions(data.data);
        } catch (error) {
            toast.error('Failed to fetch device sessions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevokeSession = async (session: DeviceSession) => {
        if (session.is_current) {
            return;
        }

        try {
            const response = await fetch('/api/sessions/revoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ session_id: session.id }),
            });

            if (response.ok) {
                await fetchSessions();
                toast.success('Session revoked successfully');
            } else {
                throw new Error('Failed to revoke session');
            }
        } catch (error) {
            toast.error('Failed to revoke session');
        }
    };

    const handleRevokeAllSessions = async () => {
        try {
            const response = await fetch('/api/sessions/revoke-all', {
                method: 'POST',
            });

            if (response.ok) {
                await fetchSessions();
                setShowConfirmDialog(false);
                toast.success('All other sessions revoked successfully');
            } else {
                throw new Error('Failed to revoke sessions');
            }
        } catch (error) {
            toast.error('Failed to revoke sessions');
        }
    };

    const getDeviceIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'mobile':
                return <Smartphone className="h-4 w-4" />;
            case 'tablet':
                return <Tablet className="h-4 w-4" />;
            case 'desktop':
                return <Laptop className="h-4 w-4" />;
            default:
                return <Globe className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                    Manage your active sessions across different devices
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sessions.length > 1 && (
                        <Button
                            variant="destructive"
                            onClick={() => setShowConfirmDialog(true)}
                        >
                            Sign out other devices
                        </Button>
                    )}

                    <div className="space-y-4">
                        {sessions.map((session, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-center space-x-4">
                                    {getDeviceIcon(session.type)}
                                    <div>
                                        <div className="font-medium">
                                            {session.name}
                                            {session.is_current && (
                                                <span className="ml-2 text-sm text-green-600">
                                                    (Current session)
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {session.browser} on {session.platform}
                                        </div>
                                        {session.location && (
                                            <div className="text-sm text-gray-500">
                                                {session.location}
                                            </div>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            Last active: {session.last_active}
                                        </div>
                                    </div>
                                </div>
                                {!session.is_current && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRevokeSession(session)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign out other devices</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to sign out all other devices? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRevokeAllSessions}
                        >
                            Sign out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
