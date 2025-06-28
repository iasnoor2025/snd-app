import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { type RouteName, route } from 'ziggy-js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        resolve: async (name: string) => {
            console.log('SSR resolving page:', name);

            // Special case for auth pages
            if (name.startsWith('auth/')) {
                try {
                    const page = await resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'));
                    console.log('SSR found auth page:', name);
                    return page as any;
                } catch (error) {
                    console.error(`SSR could not find auth page: ${name}`, error);
                }
            }

            return (await resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'))) as any;
        },
        setup: ({ App, props }) => {
            (global as any).route = (name: string, params: any, absolute: boolean) =>
                route(name, params as any, absolute, {
                    ...(page.props.ziggy as any),
                    location: new URL((page.props as any).ziggy.location),
                });

            return <App {...props} />;
        },
    }),
);





















