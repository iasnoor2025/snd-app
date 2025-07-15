import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

// Mock Inertia.js
jest.mock('@inertiajs/react', () => ({
    Link: (props: any) => {
        const { children, ...rest } = props;
        return React.createElement('a', rest, children);
    },
    useForm: () => ({
        post: jest.fn(),
        processing: false,
    }),
    usePage: () => ({
        props: {
            flash: {},
        },
    }),
}));
