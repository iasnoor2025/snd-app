import { render, screen } from '@testing-library/react';
import ActivityFeed, { ActivityFeedProps } from './ActivityFeed';

describe('ActivityFeed', () => {
    it('renders activity items', () => {
        const activities: ActivityFeedProps['activities'] = [
            { id: '1', user: 'Alice', action: 'created a project', time: '2m ago' },
            { id: '2', user: 'Bob', action: 'uploaded a file', time: '10m ago' },
        ];
        render(<ActivityFeed activities={activities} />);
        expect(screen.getByText('Alice created a project')).toBeInTheDocument();
        expect(screen.getByText('Bob uploaded a file')).toBeInTheDocument();
        expect(screen.getByText('2m ago')).toBeInTheDocument();
        expect(screen.getByText('10m ago')).toBeInTheDocument();
    });

    it('renders empty state', () => {
        render(<ActivityFeed activities={[]} />);
        expect(screen.getByText('No recent activity.')).toBeInTheDocument();
    });
});
