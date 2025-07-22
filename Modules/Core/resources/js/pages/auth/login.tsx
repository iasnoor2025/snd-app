import { Label } from '@/Core';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';



import AppLogo from '../../components/app-logo';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input } from '@/Core/components/ui';

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
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
            {/* Animated SVG Gradient Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                        <radialGradient id="login-bg1" cx="50%" cy="50%" r="80%" fx="50%" fy="50%" gradientTransform="rotate(45)">
                            <stop offset="0%" stopColor="#00eaff" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="login-bg2" cx="50%" cy="50%" r="80%" fx="50%" fy="50%" gradientTransform="rotate(120)">
                            <stop offset="0%" stopColor="#ff00ea" stopOpacity="0.13" />
                            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="900" cy="200" rx="600" ry="300" fill="url(#login-bg1)" />
                    <ellipse cx="400" cy="700" rx="500" ry="250" fill="url(#login-bg2)" />
                </svg>
            </div>
            {/* Welcome Hero Section */}
            <div className="mb-8 w-full max-w-lg flex flex-col items-center backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl p-8 animate-fade-in">
                {/* Segregated mascot/logo section */}
                <div className="flex flex-col items-center mb-4">
                    <img src="/logo.svg" alt="Mascot" className="w-16 h-16 drop-shadow-lg animate-bounce" />
                    <div className="w-12 border-b-2 border-accent/30 mt-2 mb-2" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-lg mb-2 tracking-tight">Welcome to SND Rental Management</h1>
                <p className="text-base text-center text-muted-foreground mb-2">Sign in to access your all-in-one platform for equipment, projects, employees, and more.</p>
                <span className="text-xs text-accent/80 mt-1">Empowering your business, one rental at a time.</span>
            </div>
            <Card className="w-full max-w-md shadow-xl rounded-2xl border-0 animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]">
                <CardHeader>
                    <CardTitle>Sign in to your account</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {!showMfa ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><FaEnvelope /></span>
                                    <Input id="email" type="email" className="pl-10" {...register('email', { required: 'Email is required' })} />
                                </div>
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><FaLock /></span>
                                    <Input id="password" type="password" className="pl-10" {...register('password', { required: 'Password is required' })} />
                                </div>
                                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                            </div>
                            <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg hover:scale-105 transition-transform duration-200" disabled={isLoading}>
                                Sign in
                            </Button>
                            <div className="flex items-center my-2">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="mx-2 text-xs text-muted-foreground">or</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                            <a href="/auth/redirect/google">
                                <Button type="button" variant="outline" className="flex w-full items-center justify-center gap-2 rounded-full">
                                    <FaGoogle /> Sign in with Google
                                </Button>
                            </a>
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
                    <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                        Forgot your password?
                    </a>
                    <a href="/register" className="text-sm text-blue-600 hover:text-blue-500">
                        Create an account
                    </a>
                </CardFooter>
            </Card>
        </div>
    );
}
