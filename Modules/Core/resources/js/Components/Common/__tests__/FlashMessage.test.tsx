import { render, screen, act } from '@testing-library/react';
import { FlashMessage, FlashMessageContainer } from '../FlashMessage';
import { usePage } from '@inertiajs/react';

// Mock usePage hook
jest.mock('@inertiajs/react', () => ({
    usePage: jest.fn()
}));

describe('FlashMessage', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders success message correctly', () => {
        render(<FlashMessage type="success" message="Operation successful" />);
        const message = screen.getByText('Operation successful');
        expect(message).toBeInTheDocument();
        expect(message.parentElement).toHaveClass('bg-green-500');
    });

    it('renders error message correctly', () => {
        render(<FlashMessage type="error" message="Operation failed" />);
        const message = screen.getByText('Operation failed');
        expect(message).toBeInTheDocument();
        expect(message.parentElement).toHaveClass('bg-red-500');
    });

    it('disappears after duration', () => {
        render(<FlashMessage type="success" message="Test message" duration={3000} />);
        expect(screen.getByText('Test message')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('cleans up timer on unmount', () => {
        const { unmount } = render(<FlashMessage type="success" message="Test message" />);
        const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

        unmount();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });
});

describe('FlashMessageContainer', () => {
    it('renders success flash message', () => {
        (usePage as jest.Mock).mockReturnValue({
            props: {
                flash: {
                    success: 'Success message'
                }
            }
        });

        render(<FlashMessageContainer />);
        expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('renders error flash message', () => {
        (usePage as jest.Mock).mockReturnValue({
            props: {
                flash: {
                    error: 'Error message'
                }
            }
        });

        render(<FlashMessageContainer />);
        expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('renders both success and error messages', () => {
        (usePage as jest.Mock).mockReturnValue({
            props: {
                flash: {
                    success: 'Success message',
                    error: 'Error message'
                }
            }
        });

        render(<FlashMessageContainer />);
        expect(screen.getByText('Success message')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('renders nothing when no flash messages', () => {
        (usePage as jest.Mock).mockReturnValue({
            props: {
                flash: {}
            }
        });

        render(<FlashMessageContainer />);
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
        expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
});
