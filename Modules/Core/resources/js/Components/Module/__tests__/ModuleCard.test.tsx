import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleCard } from '../ModuleCard';
import { route } from '../../../routes';

describe('ModuleCard', () => {
    const defaultProps = {
        name: 'Test Module',
        description: 'Test Description',
        status: 'active' as const,
    };

    it('renders module information correctly', () => {
        render(<ModuleCard {...defaultProps} />);

        expect(screen.getByText('Test Module')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('displays configuration when provided', () => {
        const config = {
            setting1: 'value1',
            setting2: 'value2',
        };

        render(<ModuleCard {...defaultProps} config={config} />);

        expect(screen.getByText('Configuration')).toBeInTheDocument();
        expect(screen.getByText('setting1')).toBeInTheDocument();
        expect(screen.getByText('value1')).toBeInTheDocument();
        expect(screen.getByText('setting2')).toBeInTheDocument();
        expect(screen.getByText('value2')).toBeInTheDocument();
    });

    it('calls onInitialize when initialize button is clicked', () => {
        const onInitialize = jest.fn();
        render(<ModuleCard {...defaultProps} onInitialize={onInitialize} />);

        fireEvent.click(screen.getByText('Initialize'));
        expect(onInitialize).toHaveBeenCalledTimes(1);
    });

    it('renders correct status color', () => {
        const { rerender } = render(<ModuleCard {...defaultProps} status="active" />);
        expect(screen.getByText('active')).toHaveClass('bg-green-100');

        rerender(<ModuleCard {...defaultProps} status="inactive" />);
        expect(screen.getByText('inactive')).toHaveClass('bg-gray-100');

        rerender(<ModuleCard {...defaultProps} status="pending" />);
        expect(screen.getByText('pending')).toHaveClass('bg-yellow-100');
    });

    it('renders view details link with correct href', () => {
        render(<ModuleCard {...defaultProps} />);
        const link = screen.getByText('View Details');
        expect(link).toHaveAttribute('href', route('core.modules.show', { name: 'Test Module' }));
    });
});





















