import { render, screen } from '@testing-library/react';
import RecentProjects, { RecentProjectsProps } from './RecentProjects';

describe('RecentProjects', () => {
  it('renders project items', () => {
    const projects: RecentProjectsProps['projects'] = [
      { id: '1', name: 'Project A', status: 'Active', updatedAt: '1h ago' },
      { id: '2', name: 'Project B', status: 'Completed', updatedAt: '2d ago' },
    ];
    render(<RecentProjects projects={projects} />);
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('1h ago')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('2d ago')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<RecentProjects projects={[]} />);
    expect(screen.getByText('No recent projects.')).toBeInTheDocument();
  });
});
