import React from 'react';
import { Users, Briefcase, Calendar, Truck, DollarSign } from 'lucide-react';

const stats = [
  { label: 'Employees', value: 42, icon: <Users className="h-6 w-6 text-cyan-400" /> },
  { label: 'Projects', value: 12, icon: <Briefcase className="h-6 w-6 text-blue-400" /> },
  { label: 'Rentals', value: 27, icon: <Calendar className="h-6 w-6 text-green-400" /> },
  { label: 'Equipment', value: 58, icon: <Truck className="h-6 w-6 text-purple-400" /> },
  { label: 'Revenue', value: '$18,500', icon: <DollarSign className="h-6 w-6 text-yellow-400" /> },
];

export const QuickStats: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-5xl mx-auto mt-10">
    {stats.map((stat) => (
      <div key={stat.label} className="backdrop-blur-lg bg-white/10 border border-cyan-400/30 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center transition hover:scale-105 hover:border-cyan-400">
        <div className="mb-2">{stat.icon}</div>
        <div className="text-3xl font-extrabold text-white drop-shadow-lg">{stat.value}</div>
        <div className="text-sm text-cyan-100 mt-1 font-medium tracking-wide">{stat.label}</div>
      </div>
    ))}
  </div>
);

export default QuickStats;
