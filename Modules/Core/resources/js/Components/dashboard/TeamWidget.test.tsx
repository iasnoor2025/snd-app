import { render, screen } from '@testing-library/react';
import TeamWidget, { TeamWidgetProps } from './TeamWidget';

describe('TeamWidget', () => {
  it('renders team members', () => {
    const members: TeamWidgetProps['members'] = [
      { id: '1', name: 'Alice', role: 'Manager' },
      { id: '2', name: 'Bob', role: 'Developer' },
    ];
    render(<TeamWidget members={members} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<TeamWidget members={[]} />);
    expect(screen.getByText('No team members.')).toBeInTheDocument();
  });
});
