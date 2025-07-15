import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface VelocityChartProps {
    data: { sprint: string; completed: number }[];
}

const VelocityChart: React.FC<VelocityChartProps> = ({ data }) => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sprint" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VelocityChart;
