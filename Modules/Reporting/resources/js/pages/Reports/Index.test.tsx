import { fireEvent, render, screen } from '@testing-library/react';
import ReportsIndex from './Index';

describe('ReportsIndex', () => {
    const stats = { clients: 10, equipment: 5, rentals: 7, invoices: 12, payments: 8 };
    const recentActivity = {
        rentals: { data: [], current_page: 1, last_page: 1 },
        invoices: { data: [], current_page: 1, last_page: 1 },
        payments: { data: [], current_page: 1, last_page: 1 },
    };
    const charts = { monthlyRevenue: [{ month: 'January', total: 1000 }] };

    it('renders dashboard stats', () => {
        render(<ReportsIndex stats={stats} recentActivity={recentActivity} charts={charts} />);
        expect(screen.getByText('Clients')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('Equipment')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders the revenue chart', () => {
        render(<ReportsIndex stats={stats} recentActivity={recentActivity} charts={charts} />);
        expect(screen.getByText(/Monthly Revenue/i)).toBeInTheDocument();
    });

    it('opens the custom report modal', () => {
        render(<ReportsIndex stats={stats} recentActivity={recentActivity} charts={charts} />);
        const button = screen.getByLabelText('Create custom report');
        fireEvent.click(button);
        expect(screen.getByText(/Create Custom Report/i)).toBeInTheDocument();
    });
});
