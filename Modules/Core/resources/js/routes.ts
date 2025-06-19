import { RouteConfig } from '@inertiajs/react';

export const routes: RouteConfig = {
    'core.modules.index': '/modules',
    'core.modules.show': '/modules/:name',
    'core.modules.initialize': '/api/modules/:name/initialize',
    'core.modules.configure': '/api/modules/:name/configure',
    'core.modules.status': '/api/modules/:name/status',
};

export const route = (name: keyof typeof routes, params?: Record<string, string | number>) => {
    let url = routes[name];

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, String(value));
        });
    }

    return url;
};
</$tagName>

</$tagName>

</$tagName>




