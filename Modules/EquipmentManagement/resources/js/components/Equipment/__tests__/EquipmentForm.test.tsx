import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentForm } from '../EquipmentForm';

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

describe('EquipmentForm', () => {
    const mockSubmit = jest.fn();
    const mockCancel = jest.fn();

    beforeEach(() => {
        mockSubmit.mockClear();
        mockCancel.mockClear();
    })

    it('renders empty form correctly', () => {
        render(<EquipmentForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        // Check form fields
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/daily rate/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/weekly rate/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/monthly rate/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/serial number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/purchase date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last maintenance date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();

        // Check buttons
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    })

    it('renders form with initial values correctly', () => {
        render(
            <EquipmentForm
                equipment={mockEquipment}
                onSubmit={mockSubmit}
                onCancel={mockCancel}
            />
        );

        // Check if form fields are populated
        expect(screen.getByLabelText(/name/i)).toHaveValue('Test Equipment');
        expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
        expect(screen.getByLabelText(/category/i)).toHaveValue('Test Category');
        expect(screen.getByLabelText(/daily rate/i)).toHaveValue(100);
        expect(screen.getByLabelText(/weekly rate/i)).toHaveValue(600);
        expect(screen.getByLabelText(/monthly rate/i)).toHaveValue(2400);
        expect(screen.getByLabelText(/serial number/i)).toHaveValue('SN001');
        expect(screen.getByLabelText(/notes/i)).toHaveValue('Test Notes');
    })

    it('validates required fields', async () => {
        render(<EquipmentForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        // Try to submit without filling required fields
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        // Check for validation messages
        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/category is required/i)).toBeInTheDocument();
            expect(screen.getByText(/daily rate is required/i)).toBeInTheDocument();
            expect(screen.getByText(/serial number is required/i)).toBeInTheDocument();
        })

        expect(mockSubmit).not.toHaveBeenCalled();
    })

    it('submits form with valid data', async () => {
        render(<EquipmentForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        // Fill in required fields
        await userEvent.type(screen.getByLabelText(/name/i), 'New Equipment');
        await userEvent.type(screen.getByLabelText(/category/i), 'New Category');
        await userEvent.type(screen.getByLabelText(/daily rate/i), '150');
        await userEvent.type(screen.getByLabelText(/serial number/i), 'SN002');

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        // Check if submit was called with correct data
        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Equipment',
                category: 'New Category',
                daily_rate: 150,
                serial_number: 'SN002',
            }));
        })
    })

    it('calls onCancel when cancel button is clicked', () => {
        render(<EquipmentForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(mockCancel).toHaveBeenCalledTimes(1);
    })

    it('validates numeric fields', async () => {
        render(<EquipmentForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        // Fill in required fields
        await userEvent.type(screen.getByLabelText(/name/i), 'New Equipment');
        await userEvent.type(screen.getByLabelText(/category/i), 'New Category');
        await userEvent.type(screen.getByLabelText(/serial number/i), 'SN002');

        // Try invalid numeric values
        await userEvent.type(screen.getByLabelText(/daily rate/i), 'invalid');
        await userEvent.type(screen.getByLabelText(/weekly rate/i), 'invalid');
        await userEvent.type(screen.getByLabelText(/monthly rate/i), 'invalid');

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(screen.getByText(/daily rate must be a number/i)).toBeInTheDocument();
            expect(screen.getByText(/weekly rate must be a number/i)).toBeInTheDocument();
            expect(screen.getByText(/monthly rate must be a number/i)).toBeInTheDocument();
        })

        expect(mockSubmit).not.toHaveBeenCalled();
    })

    it('validates date fields', async () => {
        render(<EquipmentForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        // Fill in required fields
        await userEvent.type(screen.getByLabelText(/name/i), 'New Equipment');
        await userEvent.type(screen.getByLabelText(/category/i), 'New Category');
        await userEvent.type(screen.getByLabelText(/daily rate/i), '150');
        await userEvent.type(screen.getByLabelText(/serial number/i), 'SN002');

        // Try invalid date values
        await userEvent.type(screen.getByLabelText(/purchase date/i), 'invalid-date');
        await userEvent.type(screen.getByLabelText(/last maintenance date/i), 'invalid-date');

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(screen.getByText(/purchase date must be a valid date/i)).toBeInTheDocument();
            expect(screen.getByText(/last maintenance date must be a valid date/i)).toBeInTheDocument();
        })

        expect(mockSubmit).not.toHaveBeenCalled();
    })
})

















