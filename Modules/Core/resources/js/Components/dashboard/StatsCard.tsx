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
    <div className={`flex flex-col gap-2 p-4 rounded-xl bg-transparent ${className}`}>
      <motion.div
        whileHover={{ rotate: 12, color: 'var(--accent, #00eaff)' }}
        whileTap={{ scale: 0.95 }}
        className="w-7 h-7 mb-1"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {icon}
      </motion.div>
      <div className="text-xs font-semibold uppercase opacity-80 tracking-wide">{label}</div>
      <div className="text-2xl font-extrabold leading-tight">{value}</div>
      {trend && <div className="text-xs opacity-60">{trend}</div>}
    </div>
  );
};

export default StatsCard;
