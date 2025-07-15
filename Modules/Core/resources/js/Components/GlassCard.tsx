import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    onRemove?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onRemove, ...props }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);

    return (
        <motion.div
            ref={cardRef}
            className={`font-inter relative rounded-2xl border border-white/70 bg-white/80 p-6 text-gray-900 shadow-[0_2px_8px_0_rgba(31,38,135,0.15),0_8px_32px_0_rgba(31,38,135,0.25)] backdrop-blur-lg transition-all duration-300 dark:border-gray-700/50 dark:bg-gray-900/80 dark:text-gray-100 ${className}`}
            whileHover={{
                scale: 1.045,
                boxShadow: '0 8px 32px 0 rgba(0,234,255,0.25), 0 2px 8px 0 rgba(31,38,135,0.15)',
                borderColor: 'var(--accent, #00eaff)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
                borderImage: 'linear-gradient(90deg, var(--accent, #00eaff) 0%, #fff 100%) 1',
            }}
            {...props}
        >
            {/* Widget menu button */}
            <button
                className="absolute top-3 right-3 z-10 rounded-full p-1 text-gray-600 transition-colors hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((v) => !v);
                }}
                tabIndex={0}
                aria-label="Widget menu"
            >
                <MoreVertical className="h-5 w-5" />
            </button>
            {menuOpen && (
                <div className="animate-fade-in absolute top-10 right-3 z-20 flex min-w-[120px] flex-col gap-1 rounded-xl border border-gray-200/50 bg-white/95 p-2 shadow-lg dark:border-gray-700/50 dark:bg-gray-900/95">
                    <button
                        className="rounded px-3 py-2 text-left text-gray-700 transition-colors hover:bg-accent/20 dark:text-gray-300"
                        tabIndex={0}
                    >
                        Refresh
                    </button>
                    <button
                        className="rounded px-3 py-2 text-left text-gray-700 transition-colors hover:bg-accent/20 dark:text-gray-300"
                        tabIndex={0}
                    >
                        Settings
                    </button>
                    {onRemove && (
                        <button
                            className="rounded px-3 py-2 text-left text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            tabIndex={0}
                            onClick={onRemove}
                        >
                            Remove
                        </button>
                    )}
                </div>
            )}
            {/* Inner glow/reflection at the top */}
            <div className="pointer-events-none absolute top-0 left-0 h-6 w-full rounded-t-2xl bg-gradient-to-b from-white/70 to-transparent dark:from-gray-800/70" />
            <div className="relative z-10 text-gray-900 dark:text-gray-100">{children}</div>
        </motion.div>
    );
};

export default GlassCard;
