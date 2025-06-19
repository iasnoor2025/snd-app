import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Modules/Core/resources/js/components/ui/card';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import { Label } from '@/Modules/Core/resources/js/components/ui/label';
import { Textarea } from '@/Modules/Core/resources/js/components/ui/textarea';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Modules/Core/resources/js/components/ui/select';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/Modules/Core/resources/js/components/ui/alert';
import {
    MapPin,
    Clock,
    Play,
    Square,
    Pause,
    CheckCircle,
    AlertTriangle,
    Wifi,
    WifiOff,
    Smartphone,
    Navigation,
    Shield,
    Timer,
    Calendar,
    User,
    Building,
    Target
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    address?: string;
}

interface GeofenceStatus {
    is_within_geofence: boolean;
    closest_zone?: {
        id: number;
        name: string;
        distance_meters: number;
        zone_type: string;
    };
    violations: Array<{
        type: string;
        message: string;
        severity: 'low' | 'medium' | 'high';
    }>;
}

interface TimesheetEntry {
    id?: number;
    project_id: string;
    description: string;
    start_time: string;
    end_time?: string;
    location: LocationData;
    geofence_status: GeofenceStatus;
    is_offline_entry: boolean;
    device_id: string;
    app_version: string;
}

interface Project {
    id: number;
    name: string;
    code: string;
}

const MobileTimesheetLogger: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [geofenceStatus, setGeofenceStatus] = useState<GeofenceStatus | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [pausedTime, setPausedTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [projects, setProjects] = useState<Project[]>([]);
    const [offlineEntries, setOfflineEntries] = useState<TimesheetEntry[]>([]);
    const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        project_id: '',
        description: '',
        tasks: ''
    });

    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Initialize component
        initializeApp();

        // Set up event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load offline entries from localStorage
        loadOfflineEntries();

        // Set up sync interval
        syncIntervalRef.current = setInterval(syncOfflineEntries, 30000); // Sync every 30 seconds

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isTracking && !isPaused) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isTracking, isPaused]);

    const initializeApp = async () => {
        await requestLocationPermission();
        await fetchProjects();
        if (isOnline) {
            await syncOfflineEntries();
        }
    };

    const requestLocationPermission = async () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser');
            return;
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });

            setIsLocationEnabled(true);
            await updateLocation(position);
            startLocationTracking();
        } catch (error: any) {
            setLocationError(`Location access denied: ${error.message}`);
            setIsLocationEnabled(false);
        }
    };

    const startLocationTracking = () => {
  const { t } = useTranslation('timesheet');

        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            updateLocation,
            (error) => {
                console.error('Location tracking error:', error);
                setLocationError(`Location tracking error: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 60000
            }
        );
    };

    const updateLocation = async (position: GeolocationPosition) => {
        const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
        };

        setCurrentLocation(locationData);
        setLocationHistory(prev => [...prev.slice(-99), locationData]); // Keep last 100 locations

        // Get address if online
        if (isOnline) {
            try {
                const address = await reverseGeocode(locationData.latitude, locationData.longitude);
                locationData.address = address;
                setCurrentLocation({...locationData, address});
            } catch (error) {
                console.error('Reverse geocoding failed:', error);
            }
        }

        // Check geofence status
        await checkGeofenceStatus(locationData);
    };

    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        // This would typically use a geocoding service
        // For now, return coordinates as string
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    };

    const checkGeofenceStatus = async (location: LocationData) => {
        if (!isOnline) return;

        try {
            const response = await axios.post('/api/geofences/validate-location', {
                latitude: location.latitude,
                longitude: location.longitude,
                project_id: formData.project_id || null
            });

            setGeofenceStatus(response.data.data);
        } catch (error) {
            console.error('Geofence validation failed:', error);
        }
    };

    const fetchProjects = async () => {
        if (!isOnline) return;

        try {
            const response = await axios.get('/api/projects');
            setProjects(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const handleOnline = () => {
        setIsOnline(true);
        toast.success('Connection restored');
        syncOfflineEntries();
        fetchProjects();
    };

    const handleOffline = () => {
        setIsOnline(false);
        toast.warning('Working offline - entries will be synced when connection is restored');
    };

    const startTracking = () => {
        if (!currentLocation) {
            toast.error('Location is required to start tracking');
            return;
        }

        if (!formData.project_id) {
            toast.error('Please select a project');
            return;
        }

        setIsTracking(true);
        setIsPaused(false);
        setStartTime(new Date());
        setElapsedTime(0);
        setPausedTime(0);
        toast.success('Time tracking started');
    };

    const pauseTracking = () => {
        setIsPaused(true);
        setPausedTime(prev => prev + elapsedTime);
        toast.info('Time tracking paused');
    };

    const resumeTracking = () => {
        setIsPaused(false);
        setElapsedTime(0);
        toast.success('Time tracking resumed');
    };

    const stopTracking = async () => {
        if (!startTime || !currentLocation) return;

        const endTime = new Date();
        const totalSeconds = pausedTime + elapsedTime;
        const hours = totalSeconds / 3600;

        const entry: TimesheetEntry = {
            project_id: formData.project_id,
            description: formData.description,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            location: currentLocation,
            geofence_status: geofenceStatus || {
                is_within_geofence: false,
                violations: []
            },
            is_offline_entry: !isOnline,
            device_id: getDeviceId(),
            app_version: '1.0.0'
        };

        if (isOnline) {
            try {
                await submitTimesheet(entry);
                toast.success('Timesheet submitted successfully');
            } catch (error) {
                // Save offline if submission fails
                saveOfflineEntry(entry);
                toast.warning('Saved offline - will sync when connection is restored');
            }
        } else {
            saveOfflineEntry(entry);
            toast.info('Saved offline - will sync when connection is restored');
        }

        // Reset tracking state
        setIsTracking(false);
        setIsPaused(false);
        setStartTime(null);
        setElapsedTime(0);
        setPausedTime(0);
        setFormData({ project_id: '', description: '', tasks: '' });
    };

    const submitTimesheet = async (entry: TimesheetEntry) => {
        const payload = {
            project_id: parseInt(entry.project_id),
            description: entry.description,
            start_time: entry.start_time,
            end_time: entry.end_time,
            latitude: entry.location.latitude,
            longitude: entry.location.longitude,
            gps_accuracy: entry.location.accuracy,
            address: entry.location.address,
            location_history: locationHistory,
            device_id: entry.device_id,
            app_version: entry.app_version,
            is_offline_entry: entry.is_offline_entry,
            geofence_status: entry.geofence_status
        };

        const response = await axios.post('/api/timesheets/mobile', payload);
        return response.data;
    };

    const saveOfflineEntry = (entry: TimesheetEntry) => {
        const entries = [...offlineEntries, entry];
        setOfflineEntries(entries);
        localStorage.setItem('offline_timesheets', JSON.stringify(entries));
    };

    const loadOfflineEntries = () => {
        const stored = localStorage.getItem('offline_timesheets');
        if (stored) {
            try {
                const entries = JSON.parse(stored);
                setOfflineEntries(entries);
            } catch (error) {
                console.error('Failed to load offline entries:', error);
            }
        }
    };

    const syncOfflineEntries = async () => {
        if (!isOnline || offlineEntries.length === 0) return;

        const successfulSyncs: number[] = [];

        for (let i = 0; i < offlineEntries.length; i++) {
            try {
                await submitTimesheet(offlineEntries[i]);
                successfulSyncs.push(i);
            } catch (error) {
                console.error(`Failed to sync entry ${i}:`, error);
            }
        }

        if (successfulSyncs.length > 0) {
            const remainingEntries = offlineEntries.filter((_, index) => !successfulSyncs.includes(index));
            setOfflineEntries(remainingEntries);
            localStorage.setItem('offline_timesheets', JSON.stringify(remainingEntries));
            toast.success(`Synced ${successfulSyncs.length} offline entries`);
        }
    };

    const getDeviceId = (): string => {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'mobile_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getGeofenceStatusColor = () => {
        if (!geofenceStatus) return 'text-gray-500';
        if (geofenceStatus.is_within_geofence) return 'text-green-500';
        if (geofenceStatus.violations.some(v => v.severity === 'high')) return 'text-red-500';
        if (geofenceStatus.violations.some(v => v.severity === 'medium')) return 'text-yellow-500';
        return 'text-gray-500';
    };

    const getGeofenceStatusIcon = () => {
        if (!geofenceStatus) return <MapPin className="h-4 w-4" />;
        if (geofenceStatus.is_within_geofence) return <CheckCircle className="h-4 w-4" />;
        return <AlertTriangle className="h-4 w-4" />;
    };

    return (
        <div className="max-w-md mx-auto space-y-4 p-4">
            {/* Status Bar */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                            {isOnline ? (
                                <Wifi className="h-4 w-4 text-green-500" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-red-500" />
                            )}
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4" />
                            <span>{t('mobile_app')}</span>
                        </div>
                    </div>
                    {offlineEntries.length > 0 && (
                        <div className="mt-2 text-sm text-yellow-600">
                            {offlineEntries.length} entries pending sync
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Location Status */}
            <Card>
                <CardContent className="pt-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Navigation className="h-4 w-4" />
                                <span className="font-medium">Location</span>
                            </div>
                            {isLocationEnabled ? (
                                <Badge variant="secondary" className="text-green-700 bg-green-100">
                                    Enabled
                                </Badge>
                            ) : (
                                <Badge variant="destructive">
                                    Disabled
                                </Badge>
                            )}
                        </div>

                        {currentLocation && (
                            <div className="text-sm text-muted-foreground">
                                <div>{currentLocation.address || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}</div>
                                <div>Accuracy: ±{Math.round(currentLocation.accuracy)}m</div>
                            </div>
                        )}

                        {locationError && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{locationError}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Geofence Status */}
            {geofenceStatus && (
                <Card>
                    <CardContent className="pt-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-4 w-4" />
                                    <span className="font-medium">{t('geofence_status')}</span>
                                </div>
                                <div className={`flex items-center space-x-1 ${getGeofenceStatusColor()}`}>
                                    {getGeofenceStatusIcon()}
                                    <span className="text-sm">
                                        {geofenceStatus.is_within_geofence ? 'Inside Zone' : 'Outside Zone'}
                                    </span>
                                </div>
                            </div>

                            {geofenceStatus.closest_zone && (
                                <div className="text-sm text-muted-foreground">
                                    <div>Closest: {geofenceStatus.closest_zone.name}</div>
                                    <div>Distance: {Math.round(geofenceStatus.closest_zone.distance_meters)}m</div>
                                </div>
                            )}

                            {geofenceStatus.violations.length > 0 && (
                                <div className="space-y-1">
                                    {geofenceStatus.violations.map((violation, index) => (
                                        <Alert key={index} className="py-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">
                                                {violation.message}
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Time Tracking */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Timer className="h-5 w-5" />
                        <span>{t('time_tracking')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isTracking && (
                        <div className="text-center">
                            <div className="text-3xl font-mono font-bold text-primary">
                                {formatTime(pausedTime + elapsedTime)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {isPaused ? 'Paused' : 'Active'}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="project">Project</Label>
                            <Select
                                value={formData.project_id}
                                onValueChange={(value) => setFormData({...formData, project_id: value})}
                                disabled={isTracking}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ph_select_project')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder={t('ph_what_are_you_working_on')}
                                disabled={isTracking}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {!isTracking ? (
                            <Button
                                onClick={startTracking}
                                className="flex-1"
                                disabled={!isLocationEnabled || !formData.project_id}
                            >
                                <Play className="mr-2 h-4 w-4" />
                                Start
                            </Button>
                        ) : (
                            <>
                                {!isPaused ? (
                                    <Button onClick={pauseTracking} variant="outline" className="flex-1">
                                        <Pause className="mr-2 h-4 w-4" />
                                        Pause
                                    </Button>
                                ) : (
                                    <Button onClick={resumeTracking} variant="outline" className="flex-1">
                                        <Play className="mr-2 h-4 w-4" />
                                        Resume
                                    </Button>
                                )}
                                <Button onClick={stopTracking} variant="destructive" className="flex-1">
                                    <Square className="mr-2 h-4 w-4" />
                                    Stop
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={syncOfflineEntries} disabled={!isOnline || offlineEntries.length === 0}>
                            Sync Offline
                        </Button>
                        <Button variant="outline" size="sm" onClick={requestLocationPermission}>
                            Refresh Location
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MobileTimesheetLogger;














