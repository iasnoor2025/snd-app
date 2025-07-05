import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, trend, className = '' }) => {
  return (
    <div className={`flex flex-col gap-3 p-4 rounded-xl bg-transparent ${className}`}>
      <motion.div
        whileHover={{ rotate: 12, color: 'var(--accent, #00eaff)' }}
        whileTap={{ scale: 0.95 }}
        className="w-8 h-8 mb-1 text-accent"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {icon}
      </motion.div>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
        {label}
      </div>
      <div className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
        {value}
      </div>
      {trend && (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {trend}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
