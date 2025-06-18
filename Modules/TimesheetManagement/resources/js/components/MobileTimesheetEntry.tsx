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
import { Textarea } from '@/components/ui/textarea';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Play,
    Pause,
    Square,
    MapPin,
    Wifi,
    WifiOff,
    Clock,
    Calendar,
    User,
    Building,
    CheckCircle,
    AlertTriangle,
    Smartphone,
    Battery,
    Signal,
    Navigation,
    Target,
    Upload,
    Download,
    Sync,
    History,
    Settings,
    Camera,
    Mic
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Project {
    id: number;
    name: string;
    description?: string;
    location?: string;
    geofence_zones?: Array<{
        id: number;
        name: string;
        center_latitude: number;
        center_longitude: number;
        radius_meters: number;
    }>;
}

interface TimesheetEntry {
    id?: number;
    project_id: number;
    description: string;
    date: string;
    start_time: string;
    end_time?: string;
    hours_worked?: number;
    overtime_hours?: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    location?: string;
    latitude?: number;
    longitude?: number;
    gps_accuracy?: number;
    address?: string;
    is_within_geofence?: boolean;
    distance_from_site?: number;
    device_id?: string;
    app_version?: string;
    is_offline_entry?: boolean;
    sync_timestamp?: string;
    location_history?: Array<{
        latitude: number;
        longitude: number;
        timestamp: string;
        accuracy: number;
    }>;
    attachments?: Array<{
        type: 'photo' | 'audio' | 'document';
        url: string;
        name: string;
        size: number;
    }>;
}

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    address?: string;
}

interface DeviceInfo {
    id: string;
    platform: string;
    version: string;
    battery_level?: number;
    network_type?: string;
    is_online: boolean;
}

const MobileTimesheetEntry: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentEntry, setCurrentEntry] = useState<TimesheetEntry>({
        project_id: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        status: 'draft'
    });
    const [isTracking, setIsTracking] = useState(false);
    const [trackingStartTime, setTrackingStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [location, setLocation] = useState<LocationData | null>(null);
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingEntries, setPendingEntries] = useState<TimesheetEntry[]>([]);
    const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [autoSync, setAutoSync] = useState(true);
    const [trackLocation, setTrackLocation] = useState(true);
    const [highAccuracy, setHighAccuracy] = useState(true);

    const locationWatchId = useRef<number | null>(null);
    const trackingInterval = useRef<NodeJS.Timeout | null>(null);
    const syncInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        initializeApp();
        setupEventListeners();
        loadPendingEntries();

        return () => {
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (isTracking && trackingStartTime) {
            trackingInterval.current = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - trackingStartTime.getTime()) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        } else {
            if (trackingInterval.current) {
                clearInterval(trackingInterval.current);
                trackingInterval.current = null;
            }
        }

        return () => {
            if (trackingInterval.current) {
                clearInterval(trackingInterval.current);
            }
        };
    }, [isTracking, trackingStartTime]);

    useEffect(() => {
        if (autoSync && isOnline) {
            syncInterval.current = setInterval(() => {
                syncPendingEntries();
            }, 30000); // Sync every 30 seconds
        } else {
            if (syncInterval.current) {
                clearInterval(syncInterval.current);
                syncInterval.current = null;
            }
        }

        return () => {
            if (syncInterval.current) {
                clearInterval(syncInterval.current);
            }
        };
    }, [autoSync, isOnline]);

    const initializeApp = async () => {
        try {
            await Promise.all([
                fetchProjects(),
                initializeLocation(),
                getDeviceInfo()
            ]);
        } catch (error) {
            console.error('Failed to initialize app:', error);
            toast.error('Failed to initialize application');
        }
    };

    const setupEventListeners = () => {
  const { t } = useTranslation('timesheet');

        // Online/offline detection
        window.addEventListener('online', () => {
            setIsOnline(true);
            toast.success('Connection restored');
            if (autoSync) {
                syncPendingEntries();
            }
        });

        window.addEventListener('offline', () => {
            setIsOnline(false);
            toast.warning('Working offline');
        });

        // Visibility change (app backgrounding)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && isTracking) {
                // App went to background while tracking
                toast.info('Time tracking continues in background');
            }
        });

        // Before unload (app closing)
        window.addEventListener('beforeunload', (e) => {
            if (isTracking) {
                e.preventDefault();
                e.returnValue = 'Time tracking is active. Are you sure you want to leave?';
            }
        });
    };

    const cleanup = () => {
        if (locationWatchId.current) {
            navigator.geolocation.clearWatch(locationWatchId.current);
        }
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
        }
        if (syncInterval.current) {
            clearInterval(syncInterval.current);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/projects');
            setProjects(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            // Load from cache if offline
            const cachedProjects = localStorage.getItem('cached_projects');
            if (cachedProjects) {
                setProjects(JSON.parse(cachedProjects));
            }
        }
    };

    const initializeLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by this device');
            return;
        }

        const options = {
            enableHighAccuracy: highAccuracy,
            timeout: 10000,
            maximumAge: 60000
        };

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const locationData: LocationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                setLocation(locationData);
                setIsLocationEnabled(true);
                reverseGeocode(locationData);
            },
            (error) => {
                console.error('Location error:', error);
                toast.error('Failed to get location: ' + error.message);
            },
            options
        );

        // Watch position if tracking is enabled
        if (trackLocation) {
            locationWatchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const locationData: LocationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    setLocation(locationData);

                    // Add to location history if tracking
                    if (isTracking) {
                        setLocationHistory(prev => [...prev.slice(-99), locationData]); // Keep last 100 points
                    }
                },
                (error) => {
                    console.error('Location watch error:', error);
                },
                options
            );
        }
    };

    const reverseGeocode = async (locationData: LocationData) => {
        try {
            // Mock reverse geocoding - in real implementation, use a geocoding service
            const address = `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`;
            setLocation(prev => prev ? { ...prev, address } : null);
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
        }
    };

    const getDeviceInfo = () => {
        const deviceInfo: DeviceInfo = {
            id: localStorage.getItem('device_id') || generateDeviceId(),
            platform: navigator.platform,
            version: navigator.userAgent,
            is_online: navigator.onLine
        };

        // Get battery info if available
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                deviceInfo.battery_level = Math.round(battery.level * 100);
                setDeviceInfo({ ...deviceInfo });
            });
        }

        // Get network info if available
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            deviceInfo.network_type = connection.effectiveType;
        }

        setDeviceInfo(deviceInfo);

        // Store device ID for future use
        if (!localStorage.getItem('device_id')) {
            localStorage.setItem('device_id', deviceInfo.id);
        }
    };

    const generateDeviceId = () => {
        return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    };

    const loadPendingEntries = () => {
        const stored = localStorage.getItem('pending_timesheets');
        if (stored) {
            setPendingEntries(JSON.parse(stored));
        }
    };

    const savePendingEntry = (entry: TimesheetEntry) => {
        const updated = [...pendingEntries, { ...entry, id: Date.now() }];
        setPendingEntries(updated);
        localStorage.setItem('pending_timesheets', JSON.stringify(updated));
    };

    const removePendingEntry = (id: number) => {
        const updated = pendingEntries.filter(entry => entry.id !== id);
        setPendingEntries(updated);
        localStorage.setItem('pending_timesheets', JSON.stringify(updated));
    };

    const startTracking = () => {
        if (!currentEntry.project_id) {
            toast.error('Please select a project first');
            return;
        }

        const now = new Date();
        setTrackingStartTime(now);
        setIsTracking(true);
        setElapsedTime(0);
        setLocationHistory([]);

        setCurrentEntry(prev => ({
            ...prev,
            start_time: now.toTimeString().slice(0, 8),
            latitude: location?.latitude,
            longitude: location?.longitude,
            gps_accuracy: location?.accuracy,
            address: location?.address,
            device_id: deviceInfo?.id,
            app_version: '1.0.0'
        }));

        toast.success('Time tracking started');
    };

    const pauseTracking = () => {
        setIsTracking(false);
        toast.info('Time tracking paused');
    };

    const resumeTracking = () => {
        setIsTracking(true);
        toast.success('Time tracking resumed');
    };

    const stopTracking = () => {
        if (!trackingStartTime) return;

        const now = new Date();
        const totalSeconds = Math.floor((now.getTime() - trackingStartTime.getTime()) / 1000);
        const hours = totalSeconds / 3600;

        setCurrentEntry(prev => ({
            ...prev,
            end_time: now.toTimeString().slice(0, 8),
            hours_worked: Math.round(hours * 100) / 100,
            location_history: locationHistory,
            sync_timestamp: new Date().toISOString()
        }));

        setIsTracking(false);
        setTrackingStartTime(null);
        setElapsedTime(0);

        toast.success('Time tracking stopped');
    };

    const submitEntry = async () => {
        if (!currentEntry.project_id || !currentEntry.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const entryToSubmit = {
                ...currentEntry,
                is_offline_entry: !isOnline,
                sync_timestamp: new Date().toISOString()
            };

            if (isOnline) {
                await axios.post('/api/timesheets', entryToSubmit);
                toast.success('Timesheet submitted successfully');
                resetForm();
            } else {
                savePendingEntry(entryToSubmit);
                toast.success('Timesheet saved offline. Will sync when online.');
                resetForm();
            }
        } catch (error) {
            console.error('Failed to submit timesheet:', error);
            savePendingEntry(currentEntry);
            toast.error('Failed to submit. Saved offline for later sync.');
        } finally {
            setLoading(false);
        }
    };

    const syncPendingEntries = async () => {
        if (!isOnline || pendingEntries.length === 0) return;

        try {
            for (const entry of pendingEntries) {
                await axios.post('/api/timesheets', {
                    ...entry,
                    is_offline_entry: true,
                    sync_timestamp: new Date().toISOString()
                });
                removePendingEntry(entry.id!);
            }

            if (pendingEntries.length > 0) {
                toast.success(`Synced ${pendingEntries.length} offline entries`);
            }
        } catch (error) {
            console.error('Sync failed:', error);
            toast.error('Failed to sync some entries');
        }
    };

    const resetForm = () => {
        setCurrentEntry({
            project_id: 0,
            description: '',
            date: new Date().toISOString().split('T')[0],
            start_time: '',
            status: 'draft'
        });
        setLocationHistory([]);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getLocationStatus = () => {
        if (!location) return { status: 'unknown', color: 'gray', text: 'No location' };

        if (location.accuracy <= 10) {
            return { status: 'excellent', color: 'green', text: `±${Math.round(location.accuracy)}m` };
        } else if (location.accuracy <= 50) {
            return { status: 'good', color: 'yellow', text: `±${Math.round(location.accuracy)}m` };
        } else {
            return { status: 'poor', color: 'red', text: `±${Math.round(location.accuracy)}m` };
        }
    };

    const locationStatus = getLocationStatus();

    return (
        <div className="max-w-md mx-auto space-y-4 p-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{t('mobile_timesheet')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant={isOnline ? 'default' : 'destructive'}>
                        {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                        {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                    <Dialog open={showSettings} onOpenChange={setShowSettings}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Settings</DialogTitle>
                                <DialogDescription>
                                    Configure mobile timesheet preferences
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="auto-sync">{t('lbl_auto_sync')}</Label>
                                    <Switch
                                        id="auto-sync"
                                        checked={autoSync}
                                        onCheckedChange={setAutoSync}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="track-location">{t('lbl_track_location')}</Label>
                                    <Switch
                                        id="track-location"
                                        checked={trackLocation}
                                        onCheckedChange={setTrackLocation}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="high-accuracy">{t('lbl_high_accuracy_gps')}</Label>
                                    <Switch
                                        id="high-accuracy"
                                        checked={highAccuracy}
                                        onCheckedChange={setHighAccuracy}
                                    />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-2">
                <Card>
                    <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                            <MapPin className={`h-4 w-4 text-${locationStatus.color}-500`} />
                            <div>
                                <div className="text-xs text-muted-foreground">Location</div>
                                <div className="text-sm font-medium">{locationStatus.text}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                            <Upload className="h-4 w-4" />
                            <div>
                                <div className="text-xs text-muted-foreground">Pending</div>
                                <div className="text-sm font-medium">{pendingEntries.length} entries</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Time Tracking */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t('time_tracking')}</CardTitle>
                    <CardDescription>
                        {isTracking ? 'Currently tracking time' : 'Ready to start tracking'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Timer Display */}
                    <div className="text-center">
                        <div className="text-4xl font-mono font-bold">
                            {formatTime(elapsedTime)}
                        </div>
                        {trackingStartTime && (
                            <div className="text-sm text-muted-foreground">
                                Started at {trackingStartTime.toLocaleTimeString()}
                            </div>
                        )}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex justify-center space-x-2">
                        {!isTracking ? (
                            <Button onClick={startTracking} className="flex-1">
                                <Play className="mr-2 h-4 w-4" />
                                Start
                            </Button>
                        ) : (
                            <>
                                <Button onClick={pauseTracking} variant="outline" className="flex-1">
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause
                                </Button>
                                <Button onClick={stopTracking} variant="destructive" className="flex-1">
                                    <Square className="mr-2 h-4 w-4" />
                                    Stop
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Entry Form */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t('ttl_timesheet_entry')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="project">Project *</Label>
                        <Select
                            value={currentEntry.project_id.toString()}
                            onValueChange={(value) => setCurrentEntry(prev => ({ ...prev, project_id: parseInt(value) }))}
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

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            placeholder={t('ph_what_did_you_work_on')}
                            value={currentEntry.description}
                            onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={currentEntry.date}
                                onChange={(e) => setCurrentEntry(prev => ({ ...prev, date: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="start-time">{t('lbl_start_time')}</Label>
                            <Input
                                id="start-time"
                                type="time"
                                value={currentEntry.start_time}
                                onChange={(e) => setCurrentEntry(prev => ({ ...prev, start_time: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Location Info */}
                    {location && (
                        <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Navigation className="h-4 w-4" />
                                <span className="text-sm font-medium">{t('current_location')}</span>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>{location.address || 'Getting address...'}</div>
                                <div className="font-mono">
                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </div>
                                <div>Accuracy: ±{Math.round(location.accuracy)}m</div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        onClick={submitEntry}
                        disabled={loading || !currentEntry.project_id || !currentEntry.description}
                        className="w-full"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : isOnline ? (
                            <CheckCircle className="mr-2 h-4 w-4" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {isOnline ? 'Submit Entry' : 'Save Offline'}
                    </Button>
                </CardContent>
            </Card>

            {/* Pending Entries */}
            {pendingEntries.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Pending Entries ({pendingEntries.length})</span>
                            {isOnline && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={syncPendingEntries}
                                >
                                    <Sync className="mr-2 h-3 w-3" />
                                    Sync All
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {pendingEntries.slice(0, 3).map((entry) => (
                                <div key={entry.id} className="p-2 border rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-sm">
                                                {projects.find(p => p.id === entry.project_id)?.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {entry.date} • {entry.hours_worked}h
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            Offline
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {pendingEntries.length > 3 && (
                                <div className="text-center text-sm text-muted-foreground">
                                    +{pendingEntries.length - 3} more entries
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Device Info */}
            {deviceInfo && (
                <Card>
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <Smartphone className="h-3 w-3" />
                                <span>{deviceInfo.platform}</span>
                            </div>
                            {deviceInfo.battery_level && (
                                <div className="flex items-center space-x-1">
                                    <Battery className="h-3 w-3" />
                                    <span>{deviceInfo.battery_level}%</span>
                                </div>
                            )}
                            {deviceInfo.network_type && (
                                <div className="flex items-center space-x-1">
                                    <Signal className="h-3 w-3" />
                                    <span>{deviceInfo.network_type}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MobileTimesheetEntry;
