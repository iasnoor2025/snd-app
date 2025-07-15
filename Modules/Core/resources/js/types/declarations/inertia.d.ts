declare module '@inertiajs/react' {
    import { Page } from '@inertiajs/core';
    import { ComponentType } from 'react';

    export interface HeadProps {
        title: string;
    }

    export const Head: React.FC<HeadProps>;

    export interface CreateInertiaAppProps {
        resolve: (name: string) => Promise<Page>;
        setup: (props: { el: HTMLElement; App: ComponentType<any>; props: Record<string, any> }) => void;
    }

    export function createInertiaApp(props: CreateInertiaAppProps): Promise<void>;
}
