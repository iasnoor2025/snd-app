import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/Core/components/ui/form';
import { Input } from '@/Core/components/ui/input';

export default function MfaVerify() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm({
        code: '',
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await form.post('/mfa/verify', {
                onSuccess: () => {
                    toast.success('MFA verified successfully');
                },
                onError: () => {
                    toast.error('Invalid verification code');
                },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Enter the verification code from your authenticator app</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit}>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verification Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="Enter 6-digit code"
                                                maxLength={6}
                                                autoComplete="one-time-code"
                                                autoFocus
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Verifying...' : 'Verify'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
