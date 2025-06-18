import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    MapPin,
    Layers,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Navigation,
    Eye,
    EyeOff,
    Filter,
    Search,
    Users,
    Clock,
    AlertTriangle,
    CheckCircle,
    Target,
    Maximize,
    Settings
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface GeofenceZone {
    id: number;
    name: string;
    description?: string;
    center_latitude: number;
    center_longitude: number;
    radius_meters: number;
    polygon_coordinates?: Array<{ lat: number; lng: number }>;
    zone_type: 'project_site' | 'office' | 'warehouse' | 'restricted' | 'custom';
    project_id?: number;
    is_active: boolean;
    strict_enforcement: boolean;
    metadata?: {
        color?: string;
        icon?: string;
        priority?: number;
    };
    project?: {
        id: number;
        name: string;
    };
    violation_count?: number;
    compliance_rate?: number;
}

interface EmployeeLocation {
    employee_id: number;
    employee_name: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    is_within_geofence: boolean;
    current_project?: string;
    status: 'working' | 'break' | 'offline';
    accuracy: number;
}

interface LocationHistory {
    employee_id: number;
    path: Array<{
        latitude: number;
        longitude: number;
        timestamp: string;
        is_within_geofence: boolean;
    }>;
}

interface MapFilters {
    showZones: boolean;
    showEmployees: boolean;
    showViolations: boolean;
    showPaths: boolean;
    zoneTypes: string[];
    employeeStatus: string[];
    timeRange: string;
}

const GeofenceMapView: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [zones, setZones] = useState<GeofenceZone[]>([]);
    const [employees, setEmployees] = useState<EmployeeLocation[]>([]);
    const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
    const [selectedZone, setSelectedZone] = useState<GeofenceZone | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeLocation | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mapLoaded, setMapLoaded] = useState(false);

    const [filters, setFilters] = useState<MapFilters>({
        showZones: true,
        showEmployees: true,
        showViolations: true,
        showPaths: false,
        zoneTypes: ['project_site', 'office', 'warehouse', 'restricted', 'custom'],
        employeeStatus: ['working', 'break', 'offline'],
        timeRange: '1h'
    });

    const [mapLayers, setMapLayers] = useState({
        zones: new Map(),
        employees: new Map(),
        violations: new Map(),
        paths: new Map()
    });

    useEffect(() => {
        initializeMap();
        return () => {
            if (map) {
                map.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (mapLoaded) {
            fetchMapData();
            const interval = setInterval(fetchMapData, 30000); // Update every 30 seconds
            return () => clearInterval(interval);
        }
    }, [mapLoaded, filters.timeRange]);

    useEffect(() => {
        if (mapLoaded) {
            updateMapLayers();
        }
    }, [zones, employees, locationHistory, filters]);

    const initializeMap = async () => {
        try {
            // Initialize map (using Leaflet as example)
            // In a real implementation, you would use a proper mapping library
            const mockMap = {
                setView: (coords: [number, number], zoom: number) => {},
                addLayer: (layer: any) => {},
                removeLayer: (layer: any) => {},
                on: (event: string, callback: Function) => {},
                fitBounds: (bounds: any) => {},
                remove: () => {}
            };

            setMap(mockMap);
            setMapLoaded(true);
        } catch (error) {
            console.error('Failed to initialize map:', error);
            toast.error('Failed to load map');
        }
    };

    const fetchMapData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchZones(),
                fetchEmployeeLocations(),
                fetchLocationHistory()
            ]);
        } catch (error) {
            console.error('Error fetching map data:', error);
            toast.error('Failed to load map data');
        } finally {
            setLoading(false);
        }
    };

    const fetchZones = async () => {
        const response = await axios.get('/api/geofences');
        setZones(response.data.data.data || []);
    };

    const fetchEmployeeLocations = async () => {
        const params = new URLSearchParams({
            time_range: filters.timeRange,
            include_offline: 'true'
        });

        const response = await axios.get(`/api/employees/locations?${params}`);
        setEmployees(response.data.data || []);
    };

    const fetchLocationHistory = async () => {
        if (!filters.showPaths) return;

        const params = new URLSearchParams({
            time_range: filters.timeRange,
            limit: '100'
        });

        const response = await axios.get(`/api/employees/location-history?${params}`);
        setLocationHistory(response.data.data || []);
    };

    const updateMapLayers = () => {
  const { t } = useTranslation('timesheet');

        if (!map) return;

        // Clear existing layers
        Object.values(mapLayers).forEach(layerMap => {
            layerMap.forEach(layer => map.removeLayer(layer));
            layerMap.clear();
        });

        // Add zone layers
        if (filters.showZones) {
            zones
                .filter(zone => filters.zoneTypes.includes(zone.zone_type))
                .forEach(zone => {
                    const layer = createZoneLayer(zone);
                    mapLayers.zones.set(zone.id, layer);
                    map.addLayer(layer);
                });
        }

        // Add employee layers
        if (filters.showEmployees) {
            employees
                .filter(emp => filters.employeeStatus.includes(emp.status))
                .forEach(employee => {
                    const layer = createEmployeeLayer(employee);
                    mapLayers.employees.set(employee.employee_id, layer);
                    map.addLayer(layer);
                });
        }

        // Add violation markers
        if (filters.showViolations) {
            employees
                .filter(emp => !emp.is_within_geofence)
                .forEach(employee => {
                    const layer = createViolationLayer(employee);
                    mapLayers.violations.set(`violation_${employee.employee_id}`, layer);
                    map.addLayer(layer);
                });
        }

        // Add location paths
        if (filters.showPaths) {
            locationHistory.forEach(history => {
                const layer = createPathLayer(history);
                mapLayers.paths.set(history.employee_id, layer);
                map.addLayer(layer);
            });
        }
    };

    const createZoneLayer = (zone: GeofenceZone) => {
        // Mock layer creation - in real implementation, create actual map layers
        return {
            type: 'zone',
            id: zone.id,
            data: zone,
            onClick: () => {
                setSelectedZone(zone);
                setIsDetailsOpen(true);
            }
        };
    };

    const createEmployeeLayer = (employee: EmployeeLocation) => {
        return {
            type: 'employee',
            id: employee.employee_id,
            data: employee,
            onClick: () => {
                setSelectedEmployee(employee);
                setIsDetailsOpen(true);
            }
        };
    };

    const createViolationLayer = (employee: EmployeeLocation) => {
        return {
            type: 'violation',
            id: `violation_${employee.employee_id}`,
            data: employee
        };
    };

    const createPathLayer = (history: LocationHistory) => {
        return {
            type: 'path',
            id: history.employee_id,
            data: history
        };
    };

    const handleFilterChange = (key: keyof MapFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const centerOnZone = (zone: GeofenceZone) => {
        if (map) {
            map.setView([zone.center_latitude, zone.center_longitude], 16);
        }
    };

    const centerOnEmployee = (employee: EmployeeLocation) => {
        if (map) {
            map.setView([employee.latitude, employee.longitude], 18);
        }
    };

    const fitAllZones = () => {
        if (map && zones.length > 0) {
            const bounds = zones.map(zone => [zone.center_latitude, zone.center_longitude]);
            map.fitBounds(bounds);
        }
    };

    const getZoneTypeColor = (type: string) => {
        const colors = {
            project_site: '#3B82F6',
            office: '#10B981',
            warehouse: '#F59E0B',
            restricted: '#EF4444',
            custom: '#8B5CF6'
        };
        return colors[type as keyof typeof colors] || '#6B7280';
    };

    const getEmployeeStatusColor = (status: string) => {
        const colors = {
            working: '#10B981',
            break: '#F59E0B',
            offline: '#6B7280'
        };
        return colors[status as keyof typeof colors] || '#6B7280';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('geofence_map')}</h1>
                    <p className="text-muted-foreground">
                        Real-time visualization of geofence zones and employee locations
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={fitAllZones}>
                        <Maximize className="mr-2 h-4 w-4" />
                        Fit All
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
                {/* Map Controls */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Layers className="h-5 w-5" />
                            <span>{t('map_controls')}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Layer Toggles */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-zones" className="flex items-center space-x-2">
                                    <Target className="h-4 w-4" />
                                    <span>Zones</span>
                                </Label>
                                <Switch
                                    id="show-zones"
                                    checked={filters.showZones}
                                    onCheckedChange={(checked) => handleFilterChange('showZones', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-employees" className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span>Employees</span>
                                </Label>
                                <Switch
                                    id="show-employees"
                                    checked={filters.showEmployees}
                                    onCheckedChange={(checked) => handleFilterChange('showEmployees', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-violations" className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Violations</span>
                                </Label>
                                <Switch
                                    id="show-violations"
                                    checked={filters.showViolations}
                                    onCheckedChange={(checked) => handleFilterChange('showViolations', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-paths" className="flex items-center space-x-2">
                                    <Navigation className="h-4 w-4" />
                                    <span>Paths</span>
                                </Label>
                                <Switch
                                    id="show-paths"
                                    checked={filters.showPaths}
                                    onCheckedChange={(checked) => handleFilterChange('showPaths', checked)}
                                />
                            </div>
                        </div>

                        {/* Time Range */}
                        <div className="space-y-2">
                            <Label>{t('lbl_time_range')}</Label>
                            <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15m">Last 15 minutes</SelectItem>
                                    <SelectItem value="1h">{t('opt_last_hour')}</SelectItem>
                                    <SelectItem value="4h">Last 4 hours</SelectItem>
                                    <SelectItem value="24h">Last 24 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Zone List */}
                        <div className="space-y-2">
                            <Label>Zones ({zones.length})</Label>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                                {zones.map((zone) => (
                                    <div key={zone.id} className="flex items-center justify-between p-2 rounded border">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: getZoneTypeColor(zone.zone_type) }}
                                            />
                                            <span className="text-sm font-medium truncate">{zone.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => centerOnZone(zone)}
                                        >
                                            <Eye className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Employee List */}
                        <div className="space-y-2">
                            <Label>Employees ({employees.length})</Label>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                                {employees.map((employee) => (
                                    <div key={employee.employee_id} className="flex items-center justify-between p-2 rounded border">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: getEmployeeStatusColor(employee.status) }}
                                            />
                                            <span className="text-sm font-medium truncate">{employee.employee_name}</span>
                                            {!employee.is_within_geofence && (
                                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => centerOnEmployee(employee)}
                                        >
                                            <Eye className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Map Container */}
                <Card className="lg:col-span-3">
                    <CardContent className="p-0">
                        <div className="relative">
                            <div
                                ref={mapRef}
                                className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <span className="text-sm text-muted-foreground">Loading map...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                                        <MapPin className="h-12 w-12" />
                                        <span>{t('interactive_map_view')}</span>
                                        <span className="text-sm">{t('map_integration_would_be_implemented_here')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Map Legend */}
                            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
                                <div className="font-medium text-sm">Legend</div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span>{t('opt_project_site')}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span>Office/Working</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span>Warehouse/Break</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span>Restricted/Violation</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                        <span>Offline</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedZone ? 'Zone Details' : 'Employee Details'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedZone ? 'Geofence zone information' : 'Employee location information'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedZone && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: getZoneTypeColor(selectedZone.zone_type) }}
                                />
                                <span className="font-medium">{selectedZone.name}</span>
                                <Badge className={selectedZone.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                    {selectedZone.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            {selectedZone.description && (
                                <p className="text-sm text-muted-foreground">{selectedZone.description}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Type:</span>
                                    <div>{selectedZone.zone_type.replace('_', ' ')}</div>
                                </div>
                                <div>
                                    <span className="font-medium">Radius:</span>
                                    <div>{selectedZone.radius_meters}m</div>
                                </div>
                                <div>
                                    <span className="font-medium">Enforcement:</span>
                                    <div>{selectedZone.strict_enforcement ? 'Strict' : 'Standard'}</div>
                                </div>
                                <div>
                                    <span className="font-medium">Project:</span>
                                    <div>{selectedZone.project?.name || 'Global'}</div>
                                </div>
                            </div>

                            <div className="text-sm">
                                <span className="font-medium">Coordinates:</span>
                                <div className="font-mono">
                                    {selectedZone.center_latitude.toFixed(6)}, {selectedZone.center_longitude.toFixed(6)}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedEmployee && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: getEmployeeStatusColor(selectedEmployee.status) }}
                                />
                                <span className="font-medium">{selectedEmployee.employee_name}</span>
                                <Badge className={selectedEmployee.is_within_geofence ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {selectedEmployee.is_within_geofence ? 'In Zone' : 'Out of Zone'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Status:</span>
                                    <div className="capitalize">{selectedEmployee.status}</div>
                                </div>
                                <div>
                                    <span className="font-medium">Project:</span>
                                    <div>{selectedEmployee.current_project || 'None'}</div>
                                </div>
                                <div>
                                    <span className="font-medium">Accuracy:</span>
                                    <div>±{Math.round(selectedEmployee.accuracy)}m</div>
                                </div>
                                <div>
                                    <span className="font-medium">Last Update:</span>
                                    <div>{new Date(selectedEmployee.timestamp).toLocaleTimeString()}</div>
                                </div>
                            </div>

                            <div className="text-sm">
                                <span className="font-medium">Location:</span>
                                <div className="font-mono">
                                    {selectedEmployee.latitude.toFixed(6)}, {selectedEmployee.longitude.toFixed(6)}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GeofenceMapView;
