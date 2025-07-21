import rawTimeZones from '@vvo/tzdb/raw-time-zones.json';
import React, { useEffect, useRef, useState } from 'react';

function getTimezoneName(timezone: string) {
    try {
        const now = new Date();
        return (
            new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'long' })
                .formatToParts(now)
                .find((part) => part.type === 'timeZoneName')?.value || timezone
        );
    } catch {
        return timezone;
    }
}

function getTimeString(timezone: string) {
    try {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(new Date());
    } catch {
        return '--:--:--';
    }
}

const DualClockWidget: React.FC = () => {
    const [now, setNow] = useState<Date>(new Date());
    const [timezone, setTimezone] = useState<string>(() => localStorage.getItem('user-timezone') || 'Asia/Tokyo');
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        localStorage.setItem('user-timezone', timezone);
    }, [timezone]);

    // Close popup on outside click
    useEffect(() => {
        if (!showPopup) return;
        function handleClick(e: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setShowPopup(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showPopup]);

    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localCity = 'Local';
    const selectedTz = (rawTimeZones as any[]).find((tz) => tz.name === timezone) || (rawTimeZones as any[]).find((tz) => tz.name === 'Asia/Tokyo');

    // Sort all timezones alphabetically by name
    const sortedTimezones = [...(rawTimeZones as any[])].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="relative flex w-full max-w-xl flex-col items-stretch justify-center rounded-2xl backdrop-blur-lg bg-white/10 border border-cyan-400/40 shadow-xl p-0 overflow-hidden" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-2xl opacity-40" />
            {/* Local Clock - Glassmorphic */}
            <div className="flex flex-row items-center justify-between px-6 py-5 bg-white/10 backdrop-blur-lg">
                <div>
                    <div className="font-semibold text-white drop-shadow">{localCity}</div>
                    <div className="text-xs text-cyan-100/80 drop-shadow">{getTimezoneName(localTz)}</div>
                </div>
                <div className="font-mono text-3xl font-bold tracking-tight text-cyan-200 drop-shadow-glow whitespace-nowrap">{getTimeString(localTz)}</div>
            </div>
            {/* Divider */}
            <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400/40 via-transparent to-blue-400/40" />
            {/* Country Clock - Glassmorphic, Clickable */}
            <div
                className="flex flex-row items-center justify-between px-6 py-5 cursor-pointer bg-white/10 backdrop-blur-lg transition hover:bg-cyan-400/10"
                onClick={() => setShowPopup(true)}
                tabIndex={0}
                aria-label="Change timezone"
            >
                <div>
                    <div className="font-semibold text-white drop-shadow">{selectedTz?.mainCities?.[0] || selectedTz?.name}</div>
                    <div className="text-xs text-cyan-100/80 drop-shadow">{getTimezoneName(selectedTz.name)}</div>
                </div>
                <div className="font-mono text-3xl font-bold tracking-tight text-cyan-200 drop-shadow-glow whitespace-nowrap">{getTimeString(selectedTz.name)}</div>
            </div>
            {/* Popup for timezone selection */}
            {showPopup && (
                <div ref={popupRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="max-h-[60vh] min-w-[260px] overflow-y-auto rounded-2xl bg-white/90 p-4 shadow-2xl border border-cyan-400/40">
                        <select
                            className="w-full rounded border border-cyan-400/40 px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-400"
                            value={timezone}
                            onChange={(e) => {
                                setTimezone(e.target.value);
                                setShowPopup(false);
                            }}
                            size={12}
                            autoFocus
                        >
                            {sortedTimezones.map((tz) => (
                                <option key={tz.name} value={tz.name}>
                                    {(tz.mainCities && tz.mainCities.length > 0 ? tz.mainCities[0] + ' - ' : '') + tz.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 pointer-events-none" style={{ boxShadow: '0 0 24px 2px #22d3ee55' }} />
        </div>
    );
};

export default DualClockWidget;
