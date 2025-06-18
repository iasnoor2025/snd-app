import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

// Mock Inertia.js
jest.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
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
</$tagName>

</$tagName>

</$tagName>

