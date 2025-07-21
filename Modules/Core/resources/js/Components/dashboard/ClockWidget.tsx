import { Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ClockWidgetProps {
    label?: string;
    timezone?: string;
    className?: string;
}

const getTimeString = (date: Date, timezone?: string) =>
    new Intl.DateTimeFormat([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: timezone,
    }).format(date);

const getDateString = (date: Date, timezone?: string) =>
    new Intl.DateTimeFormat([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone,
    }).format(date);

const ClockWidget: React.FC<ClockWidgetProps> = ({ label = 'Clock', timezone, className = '' }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className={`relative flex flex-col items-center justify-center p-6 rounded-2xl backdrop-blur-lg bg-white/10 border border-cyan-400/40 shadow-xl ${className}`}
            style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}
        >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-xl opacity-40" />
            <div className="flex items-center gap-2 mb-2">
                <Clock className="h-6 w-6 text-cyan-400 drop-shadow-glow" />
                <span className="text-lg font-semibold tracking-wide text-white drop-shadow">{label}</span>
            </div>
            <div className="text-center font-mono text-4xl font-bold text-white drop-shadow-glow">
                {getTimeString(now, timezone)}
            </div>
            <div className="mt-1 text-center text-sm text-cyan-100/80 drop-shadow">
                {getDateString(now, timezone)}
            </div>
            {timezone && (
                <div className="mt-1 text-center text-xs text-cyan-200/70 drop-shadow">{timezone}</div>
            )}
            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 pointer-events-none" style={{ boxShadow: '0 0 24px 2px #22d3ee55' }} />
        </div>
    );
};

export default ClockWidget;
