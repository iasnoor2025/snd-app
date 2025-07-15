import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentList } from '../EquipmentList';

const mockEquipment = [
    {
        id: 1,
        name: 'Test Equipment 1',
        category: 'Category A',
        daily_rate: 100,
        status: 'available' as const,
        serial_number: 'SN001',
        last_maintenance_date: '2024-03-15T00:00:00.000Z',
    },
    {
        id: 2,
        name: 'Test Equipment 2',
        category: 'Category B',
        daily_rate: 200,
        status: 'rented' as const,
        serial_number: 'SN002',
        last_maintenance_date: '2024-03-14T00:00:00.000Z',
    },
];

describe('EquipmentList', () => {
    it('renders equipment list correctly', () => {
        render(<EquipmentList equipment={mockEquipment} />);

        // Check if equipment items are rendered
        expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
        expect(screen.getByText('Test Equipment 2')).toBeInTheDocument();

        // Check if categories are rendered
        expect(screen.getByText('Category A')).toBeInTheDocument();
        expect(screen.getByText('Category B')).toBeInTheDocument();

        // Check if status badges are rendered
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('Rented')).toBeInTheDocument();
    });

    it('filters equipment by search term', async () => {
        render(<EquipmentList equipment={mockEquipment} />);

        const searchInput = screen.getByPlaceholderText('Search equipment...');
        await userEvent.type(searchInput, 'Test Equipment 1');

        expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Equipment 2')).not.toBeInTheDocument();
    });

    it('filters equipment by status', () => {
        render(<EquipmentList equipment={mockEquipment} />);

        const statusSelect = screen.getByRole('combobox', { name: /status/i });
        fireEvent.change(statusSelect, { target: { value: 'available' } });

        expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Equipment 2')).not.toBeInTheDocument();
    });

    it('filters equipment by category', () => {
        render(<EquipmentList equipment={mockEquipment} />);

        const categorySelect = screen.getByRole('combobox', { name: /category/i });
        fireEvent.change(categorySelect, { target: { value: 'Category A' } });

        expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Equipment 2')).not.toBeInTheDocument();
    });

    it('sorts equipment by name', () => {
        render(<EquipmentList equipment={mockEquipment} />);

        const nameHeader = screen.getByText('Name');
        fireEvent.click(nameHeader);

        const rows = screen.getAllByRole('row');
        const firstRow = rows[1]; // Skip header row
        expect(firstRow).toHaveTextContent('Test Equipment 1');

        fireEvent.click(nameHeader); // Click again to reverse sort
        const reversedRows = screen.getAllByRole('row');
        const firstReversedRow = reversedRows[1];
        expect(firstReversedRow).toHaveTextContent('Test Equipment 2');
    });

    it('sorts equipment by daily rate', () => {
        render(<EquipmentList equipment={mockEquipment} />);

        const rateHeader = screen.getByText('Daily Rate');
        fireEvent.click(rateHeader);

        const rows = screen.getAllByRole('row');
        const firstRow = rows[1]; // Skip header row
        expect(firstRow).toHaveTextContent('$100.00');

        fireEvent.click(rateHeader); // Click again to reverse sort
        const reversedRows = screen.getAllByRole('row');
        const firstReversedRow = reversedRows[1];
        expect(firstReversedRow).toHaveTextContent('$200.00');
    });

    it('displays correct currency format', () => {
        render(<EquipmentList equipment={mockEquipment} />);

        expect(screen.getByText('$100.00')).toBeInTheDocument();
        expect(screen.getByText('$200.00')).toBeInTheDocument();
    });

    it('displays correct status badge colors', () => {
        render(<EquipmentList equipment={mockEquipment} />);

        const availableBadge = screen.getByText('Available');
        const rentedBadge = screen.getByText('Rented');

        expect(availableBadge).toHaveClass('bg-green-100', 'text-green-800');
        expect(rentedBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });
});
