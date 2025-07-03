declare module 'vite-plugin-compression' {
    interface VitePluginCompressionOptions {
        algorithm?: 'gzip' | 'brotli';
        ext?: string;
    }

    export default function (options?: VitePluginCompressionOptions): unknown;
}
