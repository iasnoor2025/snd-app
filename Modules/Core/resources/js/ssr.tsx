import { Page } from '@inertiajs/inertia';
import createServer from '@inertiajs/react/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComponentType } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from './components/theme-provider';
import { TooltipProvider } from './Components/ui/tooltip';
import i18n from './i18n.js';

const globPages = {
    ...import.meta.glob('/Modules/*/resources/js/pages/**/*.tsx', { eager: true }),
    ...import.meta.glob('/Modules/*/resources/js/pages/**/*.jsx', { eager: true }),
    ...import.meta.glob('/Modules/*/resources/js/Pages/**/*.tsx', { eager: true }),
    ...import.meta.glob('/Modules/*/resources/js/Pages/**/*.jsx', { eager: true }),
    ...import.meta.glob('/resources/js/pages/**/*.tsx', { eager: true }),
    ...import.meta.glob('/resources/js/pages/**/*.jsx', { eager: true }),
} as Record<string, { default: ComponentType<any> }>;

createServer(({ component, props }: Page<any>) => {
    const mod = globPages[component];
    if (!mod) {
        throw new Error(`SSR: Unable to resolve component '${component}'`);
    }
    const PageComponent = mod.default;
    const queryClient = new QueryClient();
    return (
        <I18nextProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                    <TooltipProvider>
                        <PageComponent {...props} />
                    </TooltipProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </I18nextProvider>
    );
});
