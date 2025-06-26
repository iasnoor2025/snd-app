import type { Plugin } from 'vite';

declare module 'vite-plugin-compression' {
    interface VitePluginCompressionOptions {
        algorithm?: 'gzip' | 'brotli';
        ext?: string;
        filter?: RegExp;
        threshold?: number;
        deleteOriginFile?: boolean;
        success?: () => void;
        error?: (err: Error) => void;
    }
    export default function compression(options?: VitePluginCompressionOptions): Plugin;
} 