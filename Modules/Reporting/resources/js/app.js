import '../css/app.css';
import './bootstrap';

// import { createInertiaApp } from '@inertiajs/react';
// import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

// createInertiaApp({
//     title: (title) => `${title} - ${appName}`,
//     resolve: (name) => {
//         const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
//         return pages[`./pages/${name}.tsx`];
//     },
//     setup({ el, App, props }) {
//         const root = createRoot(el);
//         root.render(<App {...props} />);
//     },
//     progress: {
//         color: '#4B5563',
//     },
// });
