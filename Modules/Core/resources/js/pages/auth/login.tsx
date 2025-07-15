import { Label } from '@/Core';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaGoogle } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

interface LoginFormData {
    email: string;
    password: string;
}

export default function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();
    const [showMfa, setShowMfa] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginData, setLoginData] = useState<LoginFormData | null>(null);

    const onSubmit = async (data: LoginFormData) => {
        try {
            setIsLoading(true);
            const response = await axios.post('/login', data);

            if (response.data.requires_mfa) {
                setShowMfa(true);
                setLoginData(data);
                toast.info('Please enter your two-factor authentication code');
            } else {
                // Handle successful login
                window.location.href = '/dashboard';
            }
        } catch (error: any) {
            if (error.response?.data?.requires_mfa) {
                setShowMfa(true);
                setLoginData(data);
                toast.info('Please enter your two-factor authentication code');
            } else {
                toast.error(error.response?.data?.message || 'Login failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleMfaSubmit = async () => {
        if (!loginData) return;

        try {
            setIsLoading(true);
            const response = await axios.post('/login', loginData, {
                headers: {
                    'X-MFA-Code': mfaCode,
                },
            });

            // Handle successful login
            window.location.href = '/dashboard';
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid authentication code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign in to your account</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {!showMfa ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register('email', { required: 'Email is required' })} />
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" {...register('password', { required: 'Password is required' })} />
                                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                Sign in
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="mfa-code">Authentication Code</Label>
                                <Input
                                    id="mfa-code"
                                    type="text"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    placeholder="Enter your 6-digit code"
                                />
                            </div>
                            <Button onClick={handleMfaSubmit} className="w-full" disabled={isLoading || !mfaCode}>
                                Verify
                            </Button>
                            <Button variant="outline" onClick={() => setShowMfa(false)} className="w-full" disabled={isLoading}>
                                Back to Login
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <a href="/auth/redirect/google">
                        <Button type="button" variant="outline" className="flex w-full items-center justify-center gap-2">
                            <FaGoogle /> Sign in with Google
                        </Button>
                    </a>
                    <div className="flex w-full justify-between">
                        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                            Forgot your password?
                        </a>
                        <a href="/register" className="text-sm text-blue-600 hover:text-blue-500">
                            Create an account
                        </a>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
