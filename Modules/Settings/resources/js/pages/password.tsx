import { Head } from '@inertiajs/react'
import { useForm } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/Core'

export default function UpdatePasswordForm() {
  const { t } = useTranslation()
  const { data, setData, errors, put, reset, processing } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  function updatePassword(e: React.FormEvent) {
    e.preventDefault()

    put(route('user-password.update'), {
      preserveScroll: true,
      onSuccess: () => reset(),
    })
  }

  return (
    <AppLayout title={t('ui.titles.settings')} breadcrumbs={[
      { title: t('ui.titles.settings'), href: route('settings.index') },
      { title: t('settings.password'), href: route('settings.password') }
    ]}>
      <Head title={t('settings.password')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
            <form onSubmit={updatePassword} className="p-6">
              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="current_password" className="block font-medium text-sm text-gray-700">
                  {t('settings.current_password')}
                </label>
                <input
                  id="current_password"
                  type="password"
                  className="mt-1 block w-full"
                  value={data.current_password}
                  onChange={e => setData('current_password', e.target.value)}
                  autoComplete="current-password"
                  placeholder={t('settings.enter_current_password')}
                />
                {errors.current_password && <div className="text-sm text-red-600">{errors.current_password}</div>}
              </div>

              <div className="col-span-6 sm:col-span-4 mt-4">
                <label htmlFor="password" className="block font-medium text-sm text-gray-700">
                  {t('settings.new_password')}
                </label>
                <input
                  id="password"
                  type="password"
                  className="mt-1 block w-full"
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                  autoComplete="new-password"
                  placeholder={t('settings.enter_new_password')}
                />
                {errors.password && <div className="text-sm text-red-600">{errors.password}</div>}
              </div>

              <div className="col-span-6 sm:col-span-4 mt-4">
                <label htmlFor="password_confirmation" className="block font-medium text-sm text-gray-700">
                  {t('settings.confirm_password')}
                </label>
                <input
                  id="password_confirmation"
                  type="password"
                  className="mt-1 block w-full"
                  value={data.password_confirmation}
                  onChange={e => setData('password_confirmation', e.target.value)}
                  autoComplete="new-password"
                  placeholder={t('settings.confirm_new_password')}
                />
                {errors.password_confirmation && <div className="text-sm text-red-600">{errors.password_confirmation}</div>}
              </div>

              <div className="flex items-center justify-end mt-4">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition"
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
  )
}
