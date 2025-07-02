import { render, screen } from '@testing-library/react';
import StatsCard from './StatsCard';
import { BarChart } from 'lucide-react';

describe('StatsCard', () => {
  it('renders label, value, and icon', () => {
    render(
      <StatsCard
        icon={<BarChart data-testid="icon" />}
        label="Test Label"
        value={42}
        trend="+10%"
      />
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
