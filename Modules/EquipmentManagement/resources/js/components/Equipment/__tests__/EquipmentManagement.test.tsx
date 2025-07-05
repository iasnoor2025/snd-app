import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentManagement } from '../EquipmentManagement';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

const mockEquipment = [;
    {
        id: 1,
        name: 'Test Equipment 1',
        description: 'Test Description 1',
        category: 'Test Category 1',
        daily_rate: 100,
        weekly_rate: 600,
        monthly_rate: 2400,
        status: 'available' as const,
        serial_number: 'SN001',
        purchase_date: '2024-01-01T00:00:00.000Z',
        last_maintenance_date: '2024-03-15T00:00:00.000Z',
        notes: 'Test Notes 1',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-03-15T00:00:00.000Z',
    },
    {
        id: 2,
        name: 'Test Equipment 2',
        description: 'Test Description 2',
        category: 'Test Category 2',
        daily_rate: 200,
        weekly_rate: 1200,
        monthly_rate: 4800,
        status: 'rented' as const,
        serial_number: 'SN002',
        purchase_date: '2024-02-01T00:00:00.000Z',
        last_maintenance_date: '2024-03-20T00:00:00.000Z',
        notes: 'Test Notes 2',
        created_at: '2024-02-01T00:00:00.000Z',
        updated_at: '2024-03-20T00:00:00.000Z',
    },
];

describe('EquipmentManagement', () => {
    it('renders equipment list correctly', () => {
        render(<EquipmentManagement equipment={mockEquipment} />);

        // Check if equipment items are rendered
        expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
        expect(screen.getByText('Test Equipment 2')).toBeInTheDocument();

        // Check if categories are rendered
        expect(screen.getByText('Test Category 1')).toBeInTheDocument();
        expect(screen.getByText('Test Category 2')).toBeInTheDocument();

        // Check if status badges are rendered
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('Rented')).toBeInTheDocument();
    })

    it('opens create modal when Add Equipment button is clicked', async () => {
        render(<EquipmentManagement equipment={mockEquipment} />);

        // Click Add Equipment button
        fireEvent.click(screen.getByText('Add Equipment'));

        // Check if modal is opened
        await waitFor(() => {
            expect(screen.getByText('Create Equipment')).toBeInTheDocument();
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/daily rate/i)).toBeInTheDocument();
        })
    })

    it('opens edit modal when Edit button is clicked', async () => {
        render(<EquipmentManagement equipment={mockEquipment} />);

        // Click Edit button for first equipment
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);

        // Check if modal is opened with correct data
        await waitFor(() => {
            expect(screen.getByText('Edit Equipment')).toBeInTheDocument();
            expect(screen.getByLabelText(/name/i)).toHaveValue('Test Equipment 1');
            expect(screen.getByLabelText(/category/i)).toHaveValue('Test Category 1');
            expect(screen.getByLabelText(/daily rate/i)).toHaveValue(100);
        })
    })

    it('opens details modal when View button is clicked', async () => {
        render(<EquipmentManagement equipment={mockEquipment} />);

        // Click View button for first equipment
        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);

        // Check if modal is opened with correct data
        await waitFor(() => {
            expect(screen.getByText('Equipment Details')).toBeInTheDocument();
            expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
            expect(screen.getByText('Test Category 1')).toBeInTheDocument();
            expect(screen.getByText('$100.00')).toBeInTheDocument();
        })
    })

    it('filters equipment by search term', async () => {
        render(<EquipmentManagement equipment={mockEquipment} />);

        // Type in search input
        const searchInput = screen.getByPlaceholderText(/search/i);
        await userEvent.type(searchInput, 'Equipment 1');

        // Check if only matching equipment is shown
        expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Equipment 2')).not.toBeInTheDocument();
    })

    it('filters equipment by status', async () => {
        render(<EquipmentManagement equipment={mockEquipment} />);

        // Select status filter
        const statusFilter = screen.getByLabelText(/status/i);
        fireEvent.change(statusFilter, { target: { value: 'available' } })

        // Check if only available equipment is shown
        expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Equipment 2')).not.toBeInTheDocument();
    })

    it('filters equipment by category', async () => {
        render(<EquipmentManagement equipment={mockEquipment} />);

        // Select category filter
        const categoryFilter = screen.getByLabelText(/category/i);
        fireEvent.change(categoryFilter, { target: { value: 'Test Category 1' } })

        // Check if only matching category equipment is shown
        expect(screen.getByText('Test Equipment 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Equipment 2')).not.toBeInTheDocument();
    })

    it('sorts equipment by name', async () => {
        render(<EquipmentManagement equipment={mockEquipment} />);

        // Click name header to sort
        const nameHeader = screen.getByText(/name/i);
        fireEvent.click(nameHeader);

        // Get all equipment names
        const equipmentNames = screen.getAllByText(/Test Equipment/i);

        // Check if sorted in ascending order
        expect(equipmentNames[0]).toHaveTextContent('Test Equipment 1');
        expect(equipmentNames[1]).toHaveTextContent('Test Equipment 2');

        // Click again to sort in descending order
        fireEvent.click(nameHeader);

        // Get equipment names again
        const sortedEquipmentNames = screen.getAllByText(/Test Equipment/i);

        // Check if sorted in descending order
        expect(sortedEquipmentNames[0]).toHaveTextContent('Test Equipment 2');
        expect(sortedEquipmentNames[1]).toHaveTextContent('Test Equipment 1');
    })

    it('sorts equipment by daily rate', async () => {
        render(<EquipmentManagement equipment={mockEquipment} />);

        // Click daily rate header to sort
        const rateHeader = screen.getByText(/daily rate/i);
        fireEvent.click(rateHeader);

        // Get all equipment rates
        const equipmentRates = screen.getAllByText(/\$\d+\.\d{2}/);

        // Check if sorted in ascending order
        expect(equipmentRates[0]).toHaveTextContent('$100.00');
        expect(equipmentRates[1]).toHaveTextContent('$200.00');

        // Click again to sort in descending order
        fireEvent.click(rateHeader);

        // Get rates again
        const sortedRates = screen.getAllByText(/\$\d+\.\d{2}/);

        // Check if sorted in descending order
        expect(sortedRates[0]).toHaveTextContent('$200.00');
        expect(sortedRates[1]).toHaveTextContent('$100.00');
    })
})


















