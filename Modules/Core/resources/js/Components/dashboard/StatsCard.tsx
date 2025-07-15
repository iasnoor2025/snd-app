import { motion } from 'framer-motion';
import React from 'react';

interface StatsCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: string;
    className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, trend, className = '' }) => {
    return (
        <div className={`flex flex-col gap-3 rounded-xl bg-transparent p-4 ${className}`}>
            <motion.div
                whileHover={{ rotate: 12, color: 'var(--accent, #00eaff)' }}
                whileTap={{ scale: 0.95 }}
                className="mb-1 h-8 w-8 text-accent"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {icon}
            </motion.div>
            <div className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">{label}</div>
            <div className="text-2xl leading-tight font-extrabold text-gray-900 dark:text-white">{value}</div>
            {trend && <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{trend}</div>}
        </div>
    );
};

export default StatsCard;
