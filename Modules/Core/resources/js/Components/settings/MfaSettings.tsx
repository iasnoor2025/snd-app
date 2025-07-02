import { useState } from 'react';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Input } from '@/Core/components/ui/input';
import { Label } from '@/Core/components/ui/label';
import { Switch } from '@/Core/components/ui/switch';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Core/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';

interface MfaSettingsProps {
    isEnabled: boolean;
}

export default function MfaSettings({ isEnabled: initialEnabled }: MfaSettingsProps) {
    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const [isLoading, setIsLoading] = useState(false);
    const [showSetupDialog, setShowSetupDialog] = useState(false);
    const [setupData, setSetupData] = useState<{
        secret_key: string;
        qr_code_url: string;
        backup_codes: string[];
    } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');

    const handleToggle = async () => {
        if (isEnabled) {
            // Disable MFA
            setIsLoading(true);
            try {
                const response = await fetch('/api/mfa/disable', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (data.success) {
                    setIsEnabled(false);
                    toast.success('MFA disabled successfully');
                }
            } catch (error) {
                toast.error('Failed to disable MFA');
            } finally {
                setIsLoading(false);
            }
        } else {
            // Start MFA setup
            setIsLoading(true);
            try {
                const response = await fetch('/api/mfa/setup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setSetupData(data);
                setShowSetupDialog(true);
            } catch (error) {
                toast.error('Failed to start MFA setup');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVerifyAndEnable = async () => {
        if (!verificationCode) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/mfa/enable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: verificationCode }),
            });
            const data = await response.json();
            if (data.success) {
                setIsEnabled(true);
                setShowSetupDialog(false);
                toast.success('MFA enabled successfully');
            } else {
                toast.error('Invalid verification code');
            }
        } catch (error) {
            toast.error('Failed to enable MFA');
        } finally {
            setIsLoading(false);
            setVerificationCode('');
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Add an extra layer of security to your account using Google Authenticator
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>Enable 2FA</Label>
                            <p className="text-sm text-muted-foreground">
                                Use an authenticator app to generate verification codes
                            </p>
                        </div>
                        <Switch
                            checked={isEnabled}
                            onCheckedChange={handleToggle}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                            Scan the QR code with your authenticator app or enter the secret key manually
                        </DialogDescription>
                    </DialogHeader>
                    {setupData && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <QRCodeSVG value={setupData.qr_code_url} size={200} />
                            </div>
                            <div className="space-y-2">
                                <Label>Secret Key</Label>
                                <Input
                                    value={setupData.secret_key}
                                    readOnly
                                    onClick={(e) => e.currentTarget.select()}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Verification Code</Label>
                                <Input
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Backup Codes</Label>
                                <div className="rounded-md bg-muted p-4">
                                    <div className="text-sm font-mono space-y-1">
                                        {setupData.backup_codes.map((code, index) => (
                                            <div key={index}>{code}</div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            onClick={handleVerifyAndEnable}
                            disabled={!verificationCode || isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Enable 2FA'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
