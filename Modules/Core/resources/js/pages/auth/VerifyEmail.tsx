import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/Components/ui';



export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Head title="Email Verification" />

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Email Verification</CardTitle>
                    <CardDescription>
                        Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to
                        you? If you didn't receive the email, we will gladly send you another.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {status === 'verification-link-sent' && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            A new verification link has been sent to the email address you provided during registration.
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="mt-4 flex items-center justify-between">
                            <Button disabled={processing}>Resend Verification Email</Button>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Log Out
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
