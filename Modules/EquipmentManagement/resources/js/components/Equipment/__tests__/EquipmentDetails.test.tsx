import { render, screen, fireEvent } from '@testing-library/react';
import { EquipmentDetails } from '../EquipmentDetails';

const mockEquipment = {
    id: 1,
    name: 'Test Equipment',
    description: 'Test Description',
    category: 'Test Category',
    daily_rate: 100,
    weekly_rate: 600,
    monthly_rate: 2400,
    status: 'available' as const,
    serial_number: 'SN001',
    purchase_date: '2024-01-01T00:00:00.000Z',
    last_maintenance_date: '2024-03-15T00:00:00.000Z',
    notes: 'Test Notes',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-03-15T00:00:00.000Z',
};

describe('EquipmentDetails', () => {
    it('renders equipment details correctly', () => {
        render(<EquipmentDetails equipment={mockEquipment} />);

        // Check basic information
        expect(screen.getByText('Test Equipment')).toBeInTheDocument();
        expect(screen.getByText('Test Category')).toBeInTheDocument();
        expect(screen.getByText('SN001')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Test Notes')).toBeInTheDocument();

        // Check rates
        expect(screen.getByText('$100.00')).toBeInTheDocument();
        expect(screen.getByText('$600.00')).toBeInTheDocument();
        expect(screen.getByText('$2,400.00')).toBeInTheDocument();

        // Check status badge
        const statusBadge = screen.getByText('Available');
        expect(statusBadge).toBeInTheDocument();
        expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    })

    it('displays edit button when onEdit prop is provided', () => {
        const handleEdit = jest.fn();
        render(<EquipmentDetails equipment={mockEquipment} onEdit={handleEdit} />);

        const editButton = screen.getByText('Edit Equipment');
        expect(editButton).toBeInTheDocument();

        fireEvent.click(editButton);
        expect(handleEdit).toHaveBeenCalledTimes(1);
    })

    it('does not display edit button when onEdit prop is not provided', () => {
        render(<EquipmentDetails equipment={mockEquipment} />);

        const editButton = screen.queryByText('Edit Equipment');
        expect(editButton).not.toBeInTheDocument();
    })

    it('displays "No notes provided" when notes are empty', () => {
        const equipmentWithoutNotes = {
            ...mockEquipment,
            notes: '',
        };

        render(<EquipmentDetails equipment={equipmentWithoutNotes} />);
        expect(screen.getByText('No notes provided')).toBeInTheDocument();
    })

    it('displays correct status badge colors for different statuses', () => {
        const statuses = [;
            { status: 'available', classes: ['bg-green-100', 'text-green-800'] },
            { status: 'rented', classes: ['bg-blue-100', 'text-blue-800'] },
            { status: 'maintenance', classes: ['bg-yellow-100', 'text-yellow-800'] },
            { status: 'retired', classes: ['bg-gray-100', 'text-gray-800'] },
        ];

        statuses.forEach(({ status, classes }) => {
            const equipment = {
                ...mockEquipment,
                status: status as 'available' | 'rented' | 'maintenance' | 'retired',
            };

            const { unmount } = render(<EquipmentDetails equipment={equipment} />);

            const statusBadge = screen.getByText(status.charAt(0).toUpperCase() + status.slice(1));
            classes.forEach(className => {
                expect(statusBadge).toHaveClass(className);
            })

            unmount();
        })
    })

    it('formats currency values correctly', () => {
        const equipmentWithDifferentRates = {
            ...mockEquipment,
            daily_rate: 1234.56,
            weekly_rate: 7890.12,
            monthly_rate: 34567.89,
        };

        render(<EquipmentDetails equipment={equipmentWithDifferentRates} />);

        expect(screen.getByText('$1,234.56')).toBeInTheDocument();
        expect(screen.getByText('$7,890.12')).toBeInTheDocument();
        expect(screen.getByText('$34,567.89')).toBeInTheDocument();
    })
})


















