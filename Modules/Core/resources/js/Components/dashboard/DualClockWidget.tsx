import React, { useState, useEffect, useRef } from 'react';
import rawTimeZones from '@vvo/tzdb/raw-time-zones.json';

function getTimezoneName(timezone: string) {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'long' })
      .formatToParts(now)
      .find(part => part.type === 'timeZoneName')?.value || timezone;
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
  const selectedTz = (rawTimeZones as any[]).find(tz => tz.name === timezone) || (rawTimeZones as any[]).find(tz => tz.name === 'Asia/Tokyo');

  // Sort all timezones alphabetically by name
  const sortedTimezones = [...(rawTimeZones as any[])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col w-full relative">
      {/* Local Clock - Light */}
      <div className="flex-1 min-w-0 h-full bg-white text-black px-4 py-3 flex flex-row items-center justify-between">
        <div>
          <div className="font-semibold">{localCity}</div>
          <div className="text-xs text-muted-foreground">{getTimezoneName(localTz)}</div>
        </div>
        <div className="text-2xl font-mono font-bold tracking-tight whitespace-nowrap">{getTimeString(localTz)}</div>
      </div>
      {/* Country Clock - Dark, Clickable */}
      <div
        className="flex-1 min-w-0 h-full bg-black text-white px-4 py-3 flex flex-row items-center justify-between cursor-pointer hover:bg-gray-900 transition"
        onClick={() => setShowPopup(true)}
        tabIndex={0}
        aria-label="Change timezone"
      >
        <div>
          <div className="font-semibold">{selectedTz?.mainCities?.[0] || selectedTz?.name}</div>
          <div className="text-xs text-gray-300">{getTimezoneName(selectedTz.name)}</div>
        </div>
        <div className="text-2xl font-mono font-bold tracking-tight whitespace-nowrap">{getTimeString(selectedTz.name)}</div>
      </div>
      {/* Popup for timezone selection */}
      {showPopup && (
        <div
          ref={popupRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        >
          <div className="bg-white rounded shadow p-2 min-w-[260px] max-h-[60vh] overflow-y-auto">
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={timezone}
              onChange={e => {
                setTimezone(e.target.value);
                setShowPopup(false);
              }}
              size={12}
              autoFocus
            >
              {sortedTimezones.map(tz => (
                <option key={tz.name} value={tz.name}>
                  {(tz.mainCities && tz.mainCities.length > 0 ? tz.mainCities[0] + ' - ' : '') + tz.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default DualClockWidget;
