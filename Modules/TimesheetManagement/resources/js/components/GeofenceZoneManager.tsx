import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Textarea,
} from '@/Core';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Edit, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
    site_id?: number;
    is_active: boolean;
    strict_enforcement: boolean;
    buffer_meters: number;
    time_restrictions?: {
        enabled: boolean;
        start_time?: string;
        end_time?: string;
        days_of_week?: number[];
    };
    monitoring_enabled: boolean;
    alert_on_entry: boolean;
    alert_on_exit: boolean;
    metadata?: {
        color?: string;
        icon?: string;
        priority?: number;
    };
    project?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface GeofenceFormData {
    name: string;
    description: string;
    center_latitude: string;
    center_longitude: string;
    radius_meters: string;
    zone_type: string;
    project_id: string;
    is_active: boolean;
    strict_enforcement: boolean;
    buffer_meters: string;
    monitoring_enabled: boolean;
    alert_on_entry: boolean;
    alert_on_exit: boolean;
    metadata: {
        color: string;
        priority: string;
    };
}

const GeofenceZoneManager: React.FC = () => {
    const [zones, setZones] = useState<GeofenceZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterActive, setFilterActive] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState<GeofenceZone | null>(null);
    const [formData, setFormData] = useState<GeofenceFormData>({
        name: '',
        description: '',
        center_latitude: '',
        center_longitude: '',
        radius_meters: '100',
        zone_type: 'project_site',
        project_id: '',
        is_active: true,
        strict_enforcement: false,
        buffer_meters: '0',
        monitoring_enabled: true,
        alert_on_entry: false,
        alert_on_exit: false,
        metadata: {
            color: '#3B82F6',
            priority: '5',
        },
    });

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/geofences');
            setZones(response.data.data.data || []);
        } catch (error) {
            console.error('Error fetching geofence zones:', error);
            toast.error('Failed to load geofence zones');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateZone = async () => {
        try {
            const payload = {
                ...formData,
                center_latitude: parseFloat(formData.center_latitude),
                center_longitude: parseFloat(formData.center_longitude),
                radius_meters: parseInt(formData.radius_meters),
                buffer_meters: parseInt(formData.buffer_meters),
                project_id: formData.project_id ? parseInt(formData.project_id) : null,
                metadata: {
                    color: formData.metadata.color,
                    priority: parseInt(formData.metadata.priority),
                },
            };

            const response = await axios.post('/api/geofences', payload);
            setZones([...zones, response.data.data]);
            setIsCreateDialogOpen(false);
            resetForm();
            toast.success('Geofence zone created successfully');
        } catch (error: any) {
            console.error('Error creating geofence zone:', error);
            toast.error(error.response?.data?.message || 'Failed to create geofence zone');
        }
    };

    const handleUpdateZone = async () => {
        if (!selectedZone) return;

        try {
            const payload = {
                ...formData,
                center_latitude: parseFloat(formData.center_latitude),
                center_longitude: parseFloat(formData.center_longitude),
                radius_meters: parseInt(formData.radius_meters),
                buffer_meters: parseInt(formData.buffer_meters),
                project_id: formData.project_id ? parseInt(formData.project_id) : null,
                metadata: {
                    color: formData.metadata.color,
                    priority: parseInt(formData.metadata.priority),
                },
            };

            const response = await axios.put(`/api/geofences/${selectedZone.id}`, payload);
            setZones(zones.map((zone) => (zone.id === selectedZone.id ? response.data.data : zone)));
            setIsEditDialogOpen(false);
            setSelectedZone(null);
            resetForm();
            toast.success('Geofence zone updated successfully');
        } catch (error: any) {
            console.error('Error updating geofence zone:', error);
            toast.error(error.response?.data?.message || 'Failed to update geofence zone');
        }
    };

    const handleDeleteZone = async (zone: GeofenceZone) => {
        if (!confirm(`Are you sure you want to delete the geofence zone "${zone.name}"?`)) {
            return;
        }

        try {
            await axios.delete(`/api/geofences/${zone.id}`);
            setZones(zones.filter((z) => z.id !== zone.id));
            toast.success('Geofence zone deleted successfully');
        } catch (error: any) {
            console.error('Error deleting geofence zone:', error);
            toast.error(error.response?.data?.message || 'Failed to delete geofence zone');
        }
    };

    const handleToggleActive = async (zone: GeofenceZone) => {
        try {
            const response = await axios.post(`/api/geofences/${zone.id}/toggle-active`);
            setZones(zones.map((z) => (z.id === zone.id ? response.data.data : z)));
            toast.success(`Geofence zone ${response.data.data.is_active ? 'activated' : 'deactivated'}`);
        } catch (error: any) {
            console.error('Error toggling geofence zone:', error);
            toast.error(error.response?.data?.message || 'Failed to toggle geofence zone');
        }
    };

    const openEditDialog = (zone: GeofenceZone) => {
        const { t } = useTranslation('timesheet');

        setSelectedZone(zone);
        setFormData({
            name: zone.name,
            description: zone.description || '',
            center_latitude: zone.center_latitude.toString(),
            center_longitude: zone.center_longitude.toString(),
            radius_meters: zone.radius_meters.toString(),
            zone_type: zone.zone_type,
            project_id: zone.project_id?.toString() || '',
            is_active: zone.is_active,
            strict_enforcement: zone.strict_enforcement,
            buffer_meters: zone.buffer_meters.toString(),
            monitoring_enabled: zone.monitoring_enabled,
            alert_on_entry: zone.alert_on_entry,
            alert_on_exit: zone.alert_on_exit,
            metadata: {
                color: zone.metadata?.color || '#3B82F6',
                priority: zone.metadata?.priority?.toString() || '5',
            },
        });
        setIsEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            center_latitude: '',
            center_longitude: '',
            radius_meters: '100',
            zone_type: 'project_site',
            project_id: '',
            is_active: true,
            strict_enforcement: false,
            buffer_meters: '0',
            monitoring_enabled: true,
            alert_on_entry: false,
            alert_on_exit: false,
            metadata: {
                color: '#3B82F6',
                priority: '5',
            },
        });
    };

    const filteredZones = zones.filter((zone) => {
        const matchesSearch =
            zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            zone.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            zone.project?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'all' || zone.zone_type === filterType;
        const matchesActive =
            filterActive === 'all' || (filterActive === 'active' && zone.is_active) || (filterActive === 'inactive' && !zone.is_active);

        return matchesSearch && matchesType && matchesActive;
    });

    const getZoneTypeColor = (type: string) => {
        const colors = {
            project_site: 'bg-blue-100 text-blue-800',
            office: 'bg-green-100 text-green-800',
            warehouse: 'bg-yellow-100 text-yellow-800',
            restricted: 'bg-red-100 text-red-800',
            custom: 'bg-purple-100 text-purple-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const formatDistance = (meters: number) => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)}km`;
        }
        return `${meters}m`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('geofence_zones')}</h1>
                    <p className="text-muted-foreground">Manage location-based boundaries for timesheet validation</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Zone
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t('ttl_create_geofence_zone')}</DialogTitle>
                            <DialogDescription>Define a new geographical boundary for timesheet validation.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('lbl_zone_name')}</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder={t('ph_enter_zone_name')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zone_type">{t('lbl_zone_type')}</Label>
                                    <Select value={formData.zone_type} onValueChange={(value) => setFormData({ ...formData, zone_type: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="project_site">{t('opt_project_site')}</SelectItem>
                                            <SelectItem value="office">Office</SelectItem>
                                            <SelectItem value="warehouse">Warehouse</SelectItem>
                                            <SelectItem value="restricted">{t('opt_restricted_area')}</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={t('ph_optional_description')}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={formData.center_latitude}
                                        onChange={(e) => setFormData({ ...formData, center_latitude: e.target.value })}
                                        placeholder={t('ph_90_to_90')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={formData.center_longitude}
                                        onChange={(e) => setFormData({ ...formData, center_longitude: e.target.value })}
                                        placeholder={t('ph_180_to_180')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="radius">Radius (meters)</Label>
                                    <Input
                                        id="radius"
                                        type="number"
                                        value={formData.radius_meters}
                                        onChange={(e) => setFormData({ ...formData, radius_meters: e.target.value })}
                                        placeholder="100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="buffer">Buffer Distance (meters)</Label>
                                    <Input
                                        id="buffer"
                                        type="number"
                                        value={formData.buffer_meters}
                                        onChange={(e) => setFormData({ ...formData, buffer_meters: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">{t('lbl_zone_color')}</Label>
                                    <Input
                                        id="color"
                                        type="color"
                                        value={formData.metadata.color}
                                        onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, color: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                    <Label htmlFor="active">Active</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="strict"
                                        checked={formData.strict_enforcement}
                                        onCheckedChange={(checked) => setFormData({ ...formData, strict_enforcement: checked })}
                                    />
                                    <Label htmlFor="strict">{t('lbl_strict_enforcement')}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="monitoring"
                                        checked={formData.monitoring_enabled}
                                        onCheckedChange={(checked) => setFormData({ ...formData, monitoring_enabled: checked })}
                                    />
                                    <Label htmlFor="monitoring">{t('lbl_enable_monitoring')}</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateZone}>Create Zone</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="min-w-[200px] flex-1">
                            <div className="relative">
                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('ph_search_zones')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder={t('lbl_zone_type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('opt_all_types_1')}</SelectItem>
                                <SelectItem value="project_site">{t('opt_project_site')}</SelectItem>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="warehouse">Warehouse</SelectItem>
                                <SelectItem value="restricted">Restricted</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterActive} onValueChange={setFilterActive}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder={t('ph_status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('opt_all_status')}</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Zones Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Geofence Zones ({filteredZones.length})</CardTitle>
                    <CardDescription>Manage and monitor geographical boundaries for timesheet validation</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Zone</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Radius</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Enforcement</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredZones.map((zone) => (
                                    <TableRow key={zone.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: zone.metadata?.color || '#3B82F6' }}
                                                />
                                                <div>
                                                    <div className="font-medium">{zone.name}</div>
                                                    {zone.description && <div className="text-sm text-muted-foreground">{zone.description}</div>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getZoneTypeColor(zone.zone_type)}>{zone.zone_type.replace('_', ' ')}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{zone.center_latitude.toFixed(6)}</div>
                                                <div>{zone.center_longitude.toFixed(6)}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{formatDistance(zone.radius_meters)}</div>
                                                {zone.buffer_meters > 0 && (
                                                    <div className="text-muted-foreground">+{formatDistance(zone.buffer_meters)} buffer</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {zone.project ? (
                                                <div className="text-sm">{zone.project.name}</div>
                                            ) : (
                                                <span className="text-muted-foreground">Global</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {zone.is_active ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                )}
                                                <span className={zone.is_active ? 'text-green-700' : 'text-yellow-700'}>
                                                    {zone.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {zone.strict_enforcement ? (
                                                <Badge variant="destructive">Strict</Badge>
                                            ) : (
                                                <Badge variant="secondary">Standard</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleToggleActive(zone)}>
                                                    {zone.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(zone)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('ttl_edit_geofence_zone')}</DialogTitle>
                        <DialogDescription>Update the geographical boundary settings.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Same form fields as create dialog */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">{t('lbl_zone_name')}</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={t('ph_enter_zone_name')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-zone_type">{t('lbl_zone_type')}</Label>
                                <Select value={formData.zone_type} onValueChange={(value) => setFormData({ ...formData, zone_type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="project_site">{t('opt_project_site')}</SelectItem>
                                        <SelectItem value="office">Office</SelectItem>
                                        <SelectItem value="warehouse">Warehouse</SelectItem>
                                        <SelectItem value="restricted">{t('opt_restricted_area')}</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={t('ph_optional_description')}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-latitude">Latitude</Label>
                                <Input
                                    id="edit-latitude"
                                    type="number"
                                    step="any"
                                    value={formData.center_latitude}
                                    onChange={(e) => setFormData({ ...formData, center_latitude: e.target.value })}
                                    placeholder={t('ph_90_to_90')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-longitude">Longitude</Label>
                                <Input
                                    id="edit-longitude"
                                    type="number"
                                    step="any"
                                    value={formData.center_longitude}
                                    onChange={(e) => setFormData({ ...formData, center_longitude: e.target.value })}
                                    placeholder={t('ph_180_to_180')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-radius">Radius (meters)</Label>
                                <Input
                                    id="edit-radius"
                                    type="number"
                                    value={formData.radius_meters}
                                    onChange={(e) => setFormData({ ...formData, radius_meters: e.target.value })}
                                    placeholder="100"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label htmlFor="edit-active">Active</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-strict"
                                    checked={formData.strict_enforcement}
                                    onCheckedChange={(checked) => setFormData({ ...formData, strict_enforcement: checked })}
                                />
                                <Label htmlFor="edit-strict">{t('lbl_strict_enforcement')}</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateZone}>Update Zone</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GeofenceZoneManager;
