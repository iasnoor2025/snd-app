import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { getTranslation } from '@/utils/translation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth, locale = 'en' } = usePage<SharedData>().props;
    const { t } = useTranslation('profile');

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('profile_settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={t('profile_information')} description={t('update_name_email')} />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('name')}</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder={t('full_name')}
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('email_address')}</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder={t('email_address')}
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label>{t('roles')}</Label>
                            <div className="flex flex-wrap gap-2">
                                {auth.user?.roles?.length ? (
                                    auth.user.roles.map((role) => (
                                        <Badge key={role.name} variant="secondary">
                                            {t(`role_${role.name}`)}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">{t('no_roles_assigned')}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>{t('language_preference')}</Label>
                            <div className="flex items-center gap-2">
                                <LanguageSwitcher
                                    variant="default"
                                    showFlag={true}
                                    showLabel={true}
                                    className="w-fit"
                                />
                                <span className="text-sm text-muted-foreground">
                                    {t('choose_language_interface')}
                                </span>
                            </div>
                        </div>

                        {mustVerifyEmail && data.email !== auth.user.email && (
                            <div>
                                <p className="text-sm mt-2 text-muted-foreground">
                                    {t('email_unverified')}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="underline text-sm text-primary hover:text-primary/80 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        {t('resend_verification_email')}
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 font-medium text-sm text-green-600">
                                        {t('verification_link_sent')}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{t('save')}</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-muted-foreground">{t('saved')}</p>
                            </Transition>
                        </div>
                    </form>

                    <div className="mt-10 pt-10 border-t">
                        <DeleteUser />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}


