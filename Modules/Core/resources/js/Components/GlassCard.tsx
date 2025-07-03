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
      className={`backdrop-blur-lg bg-white/70 dark:bg-black/70 border border-white/60 dark:border-white/20 rounded-2xl shadow-[0_2px_8px_0_rgba(31,38,135,0.10),0_8px_32px_0_rgba(31,38,135,0.18)] transition-all duration-300 p-6 relative font-inter text-black dark:text-white ${className}`}
      whileHover={{
        scale: 1.045,
        boxShadow: '0 8px 32px 0 rgba(0,234,255,0.25), 0 2px 8px 0 rgba(31,38,135,0.10)',
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
        className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-white/40 dark:hover:bg-black/40 transition-colors"
        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
        tabIndex={0}
        aria-label="Widget menu"
      >
        <MoreVertical className="w-5 h-5 opacity-70" />
      </button>
      {menuOpen && (
        <div className="absolute top-10 right-3 z-20 min-w-[120px] bg-white/90 dark:bg-black/90 rounded-xl shadow-lg border border-white/30 dark:border-white/10 p-2 flex flex-col gap-1 animate-fade-in">
          <button className="text-left px-3 py-1 rounded hover:bg-accent/20" tabIndex={0}>Refresh</button>
          <button className="text-left px-3 py-1 rounded hover:bg-accent/20" tabIndex={0}>Settings</button>
          {onRemove && (
            <button className="text-left px-3 py-1 rounded hover:bg-accent/20 text-red-500" tabIndex={0} onClick={onRemove}>Remove</button>
          )}
        </div>
      )}
      {/* Inner glow/reflection at the top */}
      <div className="absolute left-0 top-0 w-full h-6 rounded-t-2xl bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
      <div className="relative z-10 text-black dark:text-white">{children}</div>
    </motion.div>
  );
};

export default GlassCard;
