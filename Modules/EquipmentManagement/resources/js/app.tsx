import './bootstrap';

// import { createInertiaApp } from '@inertiajs/react';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

// createInertiaApp({
//     title: (title) => `${title} - ${appName}`,
//     resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
//     setup({ el, App, props }) {
//         const root = createRoot(el);
//         root.render(<App {...props} />);
//     },
//     progress: {
//         color: '#4B5563',
//     },
// });
