import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuotationShow from './Show';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/test-utils/i18n';

describe('QuotationShow', () => {
  const baseProps = {
    quotation: {
      id: 1,
      quotation_number: 'Q-001',
      status: 'draft',
      issue_date: '2024-01-01',
      valid_until: '2024-01-10',
      total_amount: 1000,
      notes: 'Test notes',
      customer: { company_name: 'Acme Corp', contact_person: 'John Doe', email: 'john@acme.com', phone: '123456' },
      rental: { rental_number: 'R-001', status: 'pending', start_date: '2024-01-01', expected_end_date: '2024-01-10' },
    },
    quotationItems: { data: [], total: 0 },
    canApprove: true,
    canReject: true,
    canEdit: true,
    canDelete: true,
  };

  it('renders quotation details and actions', () => {
    render(<I18nextProvider i18n={i18n}><QuotationShow {...baseProps} /></I18nextProvider>);
    expect(screen.getByText(/Q-001/)).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    expect(screen.getByText(/approve/i)).toBeInTheDocument();
    expect(screen.getByText(/reject/i)).toBeInTheDocument();
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  it('hides actions if permissions are false', () => {
    render(<I18nextProvider i18n={i18n}><QuotationShow {...baseProps} canApprove={false} canReject={false} canEdit={false} canDelete={false} /></I18nextProvider>);
    expect(screen.queryByText(/approve/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/reject/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
  });

  it('shows timeline section', () => {
    render(<I18nextProvider i18n={i18n}><QuotationShow {...baseProps} /></I18nextProvider>);
    expect(screen.getByText(/status_timeline/i)).toBeInTheDocument();
  });

  it('renders i18n text', () => {
    render(<I18nextProvider i18n={i18n}><QuotationShow {...baseProps} /></I18nextProvider>);
    expect(screen.getByText(i18n.t('rental:quotation_number') + ': Q-001')).toBeInTheDocument();
  });

  it('shows error alert if quotation is missing', () => {
    render(<I18nextProvider i18n={i18n}><QuotationShow {...baseProps} quotation={null} /></I18nextProvider>);
    expect(screen.getByText(/not_found/i)).toBeInTheDocument();
  });
});
