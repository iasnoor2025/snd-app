import { usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface FlashMessageProps {
    type: 'success' | 'error';
    message: string;
    duration?: number;
}

export const FlashMessage: React.FC<FlashMessageProps> = ({ type, message, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    if (!isVisible) return null;

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed right-4 bottom-4 ${bgColor} rounded-lg px-6 py-3 text-white shadow-lg transition-opacity duration-300`}>{message}</div>
    );
};

export const FlashMessageContainer: React.FC = () => {
    const { flash } = usePage().props;

    return (
        <>
            {flash.success && <FlashMessage type="success" message={flash.success} />}
            {flash.error && <FlashMessage type="error" message={flash.error} />}
        </>
    );
};
