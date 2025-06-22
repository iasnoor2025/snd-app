import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
});

interface MapChartProps {
    data: Array<{
        equipment_id: number;
        name: string;
        latitude: number;
        longitude: number;
        last_update?: string;
        from?: { latitude: number; longitude: number };
        to?: { latitude: number; longitude: number };
    }>;
    height?: number;
    showPaths?: boolean;
}

export const MapChart: FC<MapChartProps> = ({ data, height = 400, showPaths = false }) => {
    // Calculate center point of the map
    const center = data.length > 0
        ? {
            lat: data.reduce((sum, point) => sum + point.latitude, 0) / data.length,
            lng: data.reduce((sum, point) => sum + point.longitude, 0) / data.length,
        }
        : { lat: 0, lng: 0 };

    return (
        <div style={{ height: `${height}px`, width: '100%' }}>
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {data.map((point) => (
                    <Marker
                        key={`${point.equipment_id}-${point.latitude}-${point.longitude}`}
                        position={[point.latitude, point.longitude]}
                    >
                        <Popup>
                            <div>
                                <h3 className="font-medium">{point.name}</h3>
                                <p className="text-sm">Equipment ID: {point.equipment_id}</p>
                                {point.last_update && (
                                    <p className="text-sm text-gray-500">
                                        Last update: {new Date(point.last_update).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {showPaths && data.map((point) => {
                    if (point.from && point.to) {
                        return (
                            <Polyline
                                key={`path-${point.equipment_id}`}
                                positions={[
                                    [point.from.latitude, point.from.longitude],
                                    [point.to.latitude, point.to.longitude],
                                ]}
                                color="blue"
                                weight={2}
                                opacity={0.7}
                            />
                        );
                    }
                    return null;
                })}
            </MapContainer>
        </div>
    );
};















