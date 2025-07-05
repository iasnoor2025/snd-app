import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Badge } from "@/Core";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface Location {
    latitude: number;
    longitude: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    status: string;
    battery_level?: string;
    signal_strength?: string;
    last_updated_at: string;
}

interface Alert {
    id: number;
    alert_type: string;
    severity: string;
    message: string;
    location_data: {
        latitude: number;
        longitude: number;
    };
    status: string;
    created_at: string;
}

interface EquipmentTrackingProps {
    equipmentId: number;
}

export function EquipmentTracking({ equipmentId }: EquipmentTrackingProps) {
    const { toast } = useToast();
    const [location, setLocation] = useState<Location | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [movementHistory, setMovementHistory] = useState<Location[]>([]);

    // Subscribe to location updates
    const { isConnected: isLocationConnected } = useWebSocket({
        channel: `equipment.${equipmentId}`,
        event: 'App\\Events\\EquipmentLocationUpdated',
        onMessage: (data) => {
            setLocation(data);
            setMovementHistory(prev => [...prev, data].slice(-10)); // Keep last 10 locations
        },
        onError: (error) => {
            toast({
                title: "Location Update Error",
                description: error.message || 'Failed to receive location updates',
                variant: "destructive",
            })
        },
    })

    // Subscribe to alerts
    const { isConnected: isAlertConnected } = useWebSocket({
        channel: 'alerts',
        event: 'App\\Events\\EquipmentStatusAlertCreated',
        onMessage: (data) => {
            if (data.equipment_id === equipmentId) {
                setAlerts(prev => [data, ...prev].slice(0, 5)); // Keep last 5 alerts
                toast({
                    title: data.alert_type,
                    description: data.message,
                    variant: data.severity === 'high' ? 'destructive' : 'default',
                })
            }
        },
        onError: (error) => {
            toast({
                title: "Alert Error",
                description: error.message || 'Failed to receive alerts',
                variant: "destructive",
            })
        },
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500';
            case 'inactive':
                return 'bg-gray-500';
            case 'maintenance':
                return 'bg-yellow-500';
            default:
                return 'bg-blue-500';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500';
            case 'high':
                return 'bg-orange-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const customIcon = new Icon({
        iconUrl: '/images/equipment-marker.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    })

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Equipment Tracking</span>
                        <div className="flex items-center space-x-2">
                            <Badge variant={isLocationConnected ? "success" : "destructive"}>
                                {isLocationConnected ? "Connected" : "Disconnected"}
                            </Badge>
                            {location && (
                                <Badge className={getStatusColor(location.status)}>
                                    {location.status}
                                </Badge>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {location ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                    <p>{formatDistanceToNow(new Date(location.last_updated_at))} ago</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Battery Level</p>
                                    <p>{location.battery_level || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Speed</p>
                                    <p>{location.speed ? `${location.speed} km/h` : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Signal Strength</p>
                                    <p>{location.signal_strength || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="h-[400px] rounded-lg overflow-hidden">
                                <MapContainer
                                    center={[location.latitude, location.longitude]}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker
                                        position={[location.latitude, location.longitude]}
                                        icon={customIcon}
                                    >
                                        <Popup>
                                            <div>
                                                <p className="font-medium">Equipment Location</p>
                                                <p>Status: {location.status}</p>
                                                <p>Speed: {location.speed ? `${location.speed} km/h` : 'N/A'}</p>
                                                <p>Last Updated: {formatDistanceToNow(new Date(location.last_updated_at))} ago</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                    {movementHistory.length > 1 && (
                                        <Polyline
                                            positions={movementHistory.map(loc => [loc.latitude, loc.longitude])}
                                            color="blue"
                                            weight={3}
                                        />
                                    )}
                                </MapContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                            No location data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {alerts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-start justify-between p-3 rounded-lg border"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getSeverityColor(alert.severity)}>
                                                {alert.severity}
                                            </Badge>
                                            <span className="font-medium">{alert.alert_type}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(alert.created_at))} ago
                                        </p>
                                    </div>
                                    <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                                        {alert.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

















