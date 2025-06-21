import React from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/Core/types';

export default function ValidationErrors() {
    const { errors } = usePage<PageProps>().props;

    const hasErrors = Object.keys(errors).length > 0;

    return (
        hasErrors && (
            <div className="mb-4">
                <div className="font-medium text-red-600">Whoops! Something went wrong.</div>

                <ul className="mt-3 list-disc list-inside text-sm text-red-600">
                    {Object.keys(errors).map((key) => (
                        <li key={key}>{errors[key]}</li>
                    ))}
                </ul>
            </div>
        )
    );
}





















