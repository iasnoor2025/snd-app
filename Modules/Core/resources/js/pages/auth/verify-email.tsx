// Components
import { Head } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import TextLink from '@/Core/Components/text-link';

import AuthLayout from '../../layouts/auth-layout';
import { Button } from '@/Core/Components/ui';

export default function VerifyEmail({ status }: { status?: string }) {
    const [processing, setProcessing] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        await Inertia.post(route('verification.send'));
        setProcessing(false);
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}
