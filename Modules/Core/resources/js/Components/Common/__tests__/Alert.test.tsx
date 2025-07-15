import { fireEvent, render, screen } from '@testing-library/react';
import { Bell } from 'lucide-react';
import { Alert } from '../Alert';

describe('Alert', () => {
    it('renders with title and description', () => {
        render(<Alert title="Alert Title" description="This is an alert description" />);

        expect(screen.getByText('Alert Title')).toBeInTheDocument();
        expect(screen.getByText('This is an alert description')).toBeInTheDocument();
    });

    it('renders with title only', () => {
        render(<Alert title="Alert Title" />);

        expect(screen.getByText('Alert Title')).toBeInTheDocument();
        expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });

    it('renders with description only', () => {
        render(<Alert description="This is an alert description" />);

        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        expect(screen.getByText('This is an alert description')).toBeInTheDocument();
    });

    it('applies variant classes', () => {
        const { rerender } = render(<Alert variant="default" />);
        expect(screen.getByRole('alert')).toHaveClass('bg-background');

        rerender(<Alert variant="destructive" />);
        expect(screen.getByRole('alert')).toHaveClass('bg-destructive/15');

        rerender(<Alert variant="success" />);
        expect(screen.getByRole('alert')).toHaveClass('bg-green-500/15');

        rerender(<Alert variant="warning" />);
        expect(screen.getByRole('alert')).toHaveClass('bg-yellow-500/15');

        rerender(<Alert variant="info" />);
        expect(screen.getByRole('alert')).toHaveClass('bg-blue-500/15');
    });

    it('applies size classes', () => {
        const { rerender } = render(<Alert size="sm" />);
        expect(screen.getByRole('alert')).toHaveClass('text-sm');

        rerender(<Alert size="lg" />);
        expect(screen.getByRole('alert')).toHaveClass('text-lg');
    });

    it('renders with custom icon', () => {
        render(<Alert icon={<Bell className="h-4 w-4" />} />);
        expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();
    });

    it('renders with default icon based on variant', () => {
        const { rerender } = render(<Alert variant="default" />);
        expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

        rerender(<Alert variant="destructive" />);
        expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

        rerender(<Alert variant="success" />);
        expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

        rerender(<Alert variant="warning" />);
        expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();

        rerender(<Alert variant="info" />);
        expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();
    });

    it('handles dismissible state', () => {
        const onClose = jest.fn();
        render(<Alert title="Dismissible Alert" dismissible onClose={onClose} />);

        const closeButton = screen.getByRole('button');
        expect(closeButton).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();

        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
    });

    it('does not show close button when not dismissible', () => {
        render(<Alert title="Non-dismissible Alert" />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(<Alert className="custom-alert" />);
        expect(screen.getByRole('alert')).toHaveClass('custom-alert');
    });

    describe('description prop', () => {
        it('renders string description', () => {
            render(<Alert description="Simple text description" />);
            expect(screen.getByText('Simple text description')).toBeInTheDocument();
        });

        it('renders React element description', () => {
            render(
                <Alert
                    description={
                        <div>
                            <p>Paragraph 1</p>
                            <p>Paragraph 2</p>
                        </div>
                    }
                />,
            );
            expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
            expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
        });

        it('renders component description', () => {
            const DescriptionComponent = () => <div>Custom Component</div>;
            render(<Alert description={<DescriptionComponent />} />);
            expect(screen.getByText('Custom Component')).toBeInTheDocument();
        });

        it('renders description with interactive elements', () => {
            const handleClick = jest.fn();
            render(
                <Alert
                    description={
                        <div>
                            <button onClick={handleClick}>Click me</button>
                            <span>Some text</span>
                        </div>
                    }
                />,
            );
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toBeInTheDocument();
            expect(screen.getByText('Some text')).toBeInTheDocument();

            fireEvent.click(button);
            expect(handleClick).toHaveBeenCalled();
        });

        it('renders description with multiple nested elements', () => {
            render(
                <Alert
                    description={
                        <div className="space-y-2">
                            <h3>Title</h3>
                            <p>Description text</p>
                            <ul>
                                <li>Item 1</li>
                                <li>Item 2</li>
                            </ul>
                        </div>
                    }
                />,
            );
            expect(screen.getByText('Title')).toBeInTheDocument();
            expect(screen.getByText('Description text')).toBeInTheDocument();
            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
        });
    });
});
