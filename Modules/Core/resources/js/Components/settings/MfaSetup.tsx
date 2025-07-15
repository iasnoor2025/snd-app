import { Alert, AlertDescription } from '@/Core/components/ui/alert';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Core/components/ui/dialog';
import { Input } from '@/Core/components/ui/input';
import { Label } from '@/Core/components/ui/label';
import { Switch } from '@/Core/components/ui/switch';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MfaSetupProps {
    isEnabled: boolean;
    secretKey?: string;
    backupCodes?: string[];
}

export default function MfaSetup({ isEnabled, secretKey, backupCodes }: MfaSetupProps) {
    const [showQrCode, setShowQrCode] = useState(false);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleToggleMfa = async (enabled: boolean) => {
        if (enabled) {
            setShowQrCode(true);
        } else {
            setIsSubmitting(true);
            try {
                await fetch('/api/mfa/disable', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                toast.success('Two-factor authentication disabled');
            } catch (error) {
                toast.error('Failed to disable two-factor authentication');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleVerifyAndEnable = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/mfa/verify-and-enable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: verificationCode }),
            });

            if (response.ok) {
                toast.success('Two-factor authentication enabled');
                setShowQrCode(false);
                setShowBackupCodes(true);
            } else {
                toast.error('Invalid verification code');
            }
        } catch (error) {
            toast.error('Failed to enable two-factor authentication');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                    Add an extra layer of security to your account by requiring both your password and an authentication code.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <Switch checked={isEnabled} onCheckedChange={handleToggleMfa} disabled={isSubmitting} />
                    <Label>Enable two-factor authentication</Label>
                </div>

                {isEnabled && (
                    <div className="mt-4">
                        <Button variant="outline" onClick={() => setShowBackupCodes(true)}>
                            View Backup Codes
                        </Button>
                    </div>
                )}
            </CardContent>

            <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
                        <DialogDescription>Scan this QR code with your authenticator app, then enter the verification code below.</DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-center py-4">
                        <QRCodeSVG
                            value={`otpauth://totp/SND-App:${encodeURIComponent('user@email.com')}?secret=${secretKey}&issuer=SND-App`}
                            size={200}
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Verification Code</Label>
                            <Input
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleVerifyAndEnable} disabled={isSubmitting || verificationCode.length !== 6}>
                            {isSubmitting ? 'Verifying...' : 'Verify and Enable'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Backup Codes</DialogTitle>
                        <DialogDescription>
                            Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
                        </DialogDescription>
                    </DialogHeader>

                    <Alert>
                        <AlertDescription>
                            <div className="space-y-2 font-mono">
                                {backupCodes?.map((code, index) => (
                                    <div key={index}>{code}</div>
                                ))}
                            </div>
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button onClick={() => setShowBackupCodes(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
