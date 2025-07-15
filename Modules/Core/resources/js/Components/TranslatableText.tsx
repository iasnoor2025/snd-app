/**
 * TranslatableText Component
 * Safely renders translatable content, converting objects to strings
 */

import { useTranslation } from '../hooks/useTranslation';

interface TranslatableTextProps {
    children: string | Record<string, string> | null | undefined;
    fallback?: string;
    className?: string;
}

/**
 * Component that safely renders translatable text
 * Converts translatable objects to strings to prevent React rendering errors
 */
export function TranslatableText({ children, fallback = '', className }: TranslatableTextProps) {
    const { t } = useTranslation();

    // Convert the translatable content to a string
    const text = t(children) || fallback;

    // If there's no text and no fallback, don't render anything
    if (!text) {
        return null;
    }

    return className ? <span className={className}>{text}</span> : <>{text}</>;
}

export default TranslatableText;
