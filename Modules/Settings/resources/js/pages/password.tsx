import { AppLayout } from '@/Core';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function UpdatePasswordForm() {
    const { t } = useTranslation();
    const { data, setData, errors, put, reset, processing } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function updatePassword(e: React.FormEvent) {
        e.preventDefault();

        put(route('user-password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <AppLayout
            title={t('ui.titles.settings')}
            breadcrumbs={[
                { title: t('ui.titles.settings'), href: route('settings.index') },
                { title: t('settings.password'), href: route('settings.password') },
            ]}
        >
            <Head title={t('settings.password')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-xl sm:rounded-lg">
                        <form onSubmit={updatePassword} className="p-6">
                            <div className="col-span-6 sm:col-span-4">
                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                                    {t('settings.current_password')}
                                </label>
                                <input
                                    id="current_password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                    placeholder={t('settings.enter_current_password')}
                                />
                                {errors.current_password && <div className="text-sm text-red-600">{errors.current_password}</div>}
                            </div>

                            <div className="col-span-6 mt-4 sm:col-span-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    {t('settings.new_password')}
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder={t('settings.enter_new_password')}
                                />
                                {errors.password && <div className="text-sm text-red-600">{errors.password}</div>}
                            </div>

                            <div className="col-span-6 mt-4 sm:col-span-4">
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                    {t('settings.confirm_password')}
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder={t('settings.confirm_new_password')}
                                />
                                {errors.password_confirmation && <div className="text-sm text-red-600">{errors.password_confirmation}</div>}
                            </div>

                            <div className="mt-4 flex items-center justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase transition hover:bg-gray-700 focus:border-gray-900 focus:ring focus:ring-gray-300 focus:outline-none active:bg-gray-900 disabled:opacity-25"
                                    disabled={processing}
                                >
                                    {t('ui.buttons.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
