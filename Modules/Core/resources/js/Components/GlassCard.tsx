import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

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
      className={`backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/70 dark:border-gray-700/50 rounded-2xl shadow-[0_2px_8px_0_rgba(31,38,135,0.15),0_8px_32px_0_rgba(31,38,135,0.25)] transition-all duration-300 p-6 relative font-inter text-gray-900 dark:text-gray-100 ${className}`}
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
        className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors text-gray-600 dark:text-gray-400"
        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
        tabIndex={0}
        aria-label="Widget menu"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {menuOpen && (
        <div className="absolute top-10 right-3 z-20 min-w-[120px] bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-2 flex flex-col gap-1 animate-fade-in">
          <button className="text-left px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-accent/20 transition-colors" tabIndex={0}>
            Refresh
          </button>
          <button className="text-left px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-accent/20 transition-colors" tabIndex={0}>
            Settings
          </button>
          {onRemove && (
            <button className="text-left px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors" tabIndex={0} onClick={onRemove}>
              Remove
            </button>
          )}
        </div>
      )}
      {/* Inner glow/reflection at the top */}
      <div className="absolute left-0 top-0 w-full h-6 rounded-t-2xl bg-gradient-to-b from-white/70 dark:from-gray-800/70 to-transparent pointer-events-none" />
      <div className="relative z-10 text-gray-900 dark:text-gray-100">{children}</div>
    </motion.div>
  );
};

export default GlassCard;
