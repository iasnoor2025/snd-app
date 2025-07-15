import { useEffect, useRef } from 'react';

export function EquipmentLocationMap({
    latitude,
    longitude,
    onChange,
}: {
    latitude: number;
    longitude: number;
    onChange: (lat: number, lng: number) => void;
}) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.L) return;
        const map = window.L.map(mapRef.current!).setView([latitude || 0, longitude || 0], 10);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        const marker = window.L.marker([latitude || 0, longitude || 0], { draggable: true }).addTo(map);
        marker.on('dragend', function (e: any) {
            const { lat, lng } = e.target.getLatLng();
            onChange(lat, lng);
        });
        return () => {
            map.remove();
        };
    }, [latitude, longitude]);

    return <div ref={mapRef} style={{ width: '100%', height: 300 }} />;
}
