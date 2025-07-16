import { AppLayout, Badge, Button, Card, CardContent, CardHeader, CardTitle, Label, Slider } from '@/Core';
import { Head } from '@inertiajs/react';
import {
    Activity,
    Box,
    Eye,
    EyeOff,
    Gauge,
    Layers,
    Maximize,
    Minimize,
    Monitor,
    Pause,
    Play,
    RotateCcw,
    Settings,
    Target,
    Thermometer,
    Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Equipment {
    id: number;
    name: string;
    model: string;
    serialNumber: string;
    category: string;
    status: 'running' | 'idle' | 'maintenance' | 'offline';
    operatingHours: number;
    efficiency: number;
    location: {
        x: number;
        y: number;
        z: number;
        rotation: {
            x: number;
            y: number;
            z: number;
        };
    };
}

interface Component3D {
    id: string;
    name: string;
    type: 'engine' | 'hydraulic' | 'transmission' | 'electrical' | 'cooling' | 'structural';
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    health: number;
    temperature: number;
    pressure?: number;
    vibration?: number;
    isVisible: boolean;
    isHighlighted: boolean;
    color: string;
    opacity: number;
}

interface SimulationScenario {
    id: string;
    name: string;
    description: string;
    duration: number; // in seconds
    parameters: {
        load: number;
        speed: number;
        temperature: number;
        pressure: number;
    };
    expectedOutcome: {
        efficiency: number;
        wearRate: number;
        fuelConsumption: number;
        maintenanceNeeded: boolean;
    };
}

interface DigitalTwinData {
    equipment: Equipment;
    components: Component3D[];
    realTimeMetrics: {
        timestamp: string;
        temperature: number;
        pressure: number;
        vibration: number;
        efficiency: number;
        powerConsumption: number;
    }[];
    simulationResults?: {
        scenario: string;
        results: any[];
        predictions: {
            nextMaintenance: string;
            expectedLifespan: number;
            optimizationSuggestions: string[];
        };
    };
}

interface Props {
    equipment: Equipment;
    digitalTwinData: DigitalTwinData;
    scenarios: SimulationScenario[];
}

const DigitalTwinVisualization: React.FC<Props> = ({ equipment, digitalTwinData, scenarios = [] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedComponent, setSelectedComponent] = useState<Component3D | null>(null);
    const [viewMode, setViewMode] = useState<'3d' | 'wireframe' | 'xray'>('3d');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationProgress, setSimulationProgress] = useState(0);
    const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(scenarios[0] || null);
    const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 5 });
    const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0, z: 0 });
    const [zoom, setZoom] = useState(1);
    const [showMetrics, setShowMetrics] = useState(true);
    const [autoRotate, setAutoRotate] = useState(false);
    const [components, setComponents] = useState<Component3D[]>(digitalTwinData.components || []);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Mock 3D rendering (in a real implementation, you'd use Three.js or similar)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Set canvas size
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            // Draw background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#1e293b');
            gradient.addColorStop(1, '#0f172a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            const gridSize = 50;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw equipment representation (simplified 3D-like view)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Main equipment body
            ctx.fillStyle = equipment.status === 'running' ? '#10b981' : equipment.status === 'maintenance' ? '#f59e0b' : '#ef4444';
            ctx.fillRect(centerX - 100, centerY - 60, 200, 120);

            // Equipment shadow/depth
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(centerX - 95, centerY - 55, 200, 120);

            // Draw components
            components.forEach((component, index) => {
                if (!component.isVisible) return;

                const x = centerX + component.position.x * 50;
                const y = centerY + component.position.y * 50;
                const size = 20 * component.scale.x;

                // Component health color
                const healthColor = component.health > 80 ? '#10b981' : component.health > 60 ? '#f59e0b' : '#ef4444';

                ctx.fillStyle = component.isHighlighted ? '#3b82f6' : healthColor;
                ctx.globalAlpha = component.opacity;

                // Draw component based on type
                switch (component.type) {
                    case 'engine':
                        ctx.fillRect(x - size / 2, y - size / 2, size, size);
                        break;
                    case 'hydraulic':
                        ctx.beginPath();
                        ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
                        ctx.fill();
                        break;
                    case 'transmission':
                        ctx.fillRect(x - size / 2, y - size / 4, size, size / 2);
                        break;
                    default:
                        ctx.fillRect(x - size / 3, y - size / 3, (size * 2) / 3, (size * 2) / 3);
                }

                ctx.globalAlpha = 1;

                // Component label
                if (component.isHighlighted || selectedComponent?.id === component.id) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '12px Arial';
                    ctx.fillText(component.name, x - 30, y - size / 2 - 10);

                    // Health indicator
                    ctx.fillStyle = healthColor;
                    ctx.fillRect(x - 25, y - size / 2 - 5, 50 * (component.health / 100), 3);
                }
            });

            // Equipment info overlay
            if (showMetrics) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(10, 10, 200, 120);

                ctx.fillStyle = '#ffffff';
                ctx.font = '14px Arial';
                ctx.fillText(equipment.name, 20, 30);
                ctx.font = '12px Arial';
                ctx.fillText(`Status: ${equipment.status}`, 20, 50);
                ctx.fillText(`Efficiency: ${equipment.efficiency}%`, 20, 70);
                ctx.fillText(`Hours: ${equipment.operatingHours}`, 20, 90);
                ctx.fillText(`Model: ${equipment.model}`, 20, 110);
            }
        };

        render();

        // Auto-rotate if enabled
        let animationId: number;
        if (autoRotate) {
            const animate = () => {
                setCameraRotation((prev) => ({ ...prev, y: prev.y + 0.01 }));
                render();
                animationId = requestAnimationFrame(animate);
            };
            animationId = requestAnimationFrame(animate);
        }

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [equipment, components, selectedComponent, showMetrics, autoRotate, cameraRotation, zoom]);

    const runSimulation = async () => {
        if (!selectedScenario) return;

        setIsSimulating(true);
        setSimulationProgress(0);

        // Simulate progress
        const duration = selectedScenario.duration * 1000; // Convert to ms
        const interval = 100; // Update every 100ms
        const steps = duration / interval;

        for (let i = 0; i <= steps; i++) {
            await new Promise((resolve) => setTimeout(resolve, interval));
            setSimulationProgress((i / steps) * 100);

            // Update component states during simulation
            setComponents((prev) =>
                prev.map((comp) => ({
                    ...comp,
                    temperature: comp.temperature + (Math.random() - 0.5) * 5,
                    health: Math.max(0, comp.health - Math.random() * 0.1),
                })),
            );
        }

        setIsSimulating(false);
    };

    const resetView = () => {
        setCameraPosition({ x: 0, y: 0, z: 5 });
        setCameraRotation({ x: 0, y: 0, z: 0 });
        setZoom(1);
    };

    const toggleComponentVisibility = (componentId: string) => {
        setComponents((prev) => prev.map((comp) => (comp.id === componentId ? { ...comp, isVisible: !comp.isVisible } : comp)));
    };

    const highlightComponent = (componentId: string) => {
        setComponents((prev) =>
            prev.map((comp) => ({
                ...comp,
                isHighlighted: comp.id === componentId,
            })),
        );
        setSelectedComponent(components.find((c) => c.id === componentId) || null);
    };

    const getComponentTypeIcon = (type: string) => {
        switch (type) {
            case 'engine':
                return <Zap className="h-4 w-4" />;
            case 'hydraulic':
                return <Gauge className="h-4 w-4" />;
            case 'transmission':
                return <Settings className="h-4 w-4" />;
            case 'electrical':
                return <Zap className="h-4 w-4" />;
            case 'cooling':
                return <Thermometer className="h-4 w-4" />;
            default:
                return <Box className="h-4 w-4" />;
        }
    };

    const getHealthColor = (health: number) => {
        if (health > 80) return 'text-green-600';
        if (health > 60) return 'text-yellow-600';
        if (health > 40) return 'text-orange-600';
        return 'text-red-600';
    };

    // Mock radar chart data for component analysis
    const radarData = [
        { subject: 'Performance', A: 85, B: 90, fullMark: 100 },
        { subject: 'Efficiency', A: 78, B: 85, fullMark: 100 },
        { subject: 'Reliability', A: 92, B: 88, fullMark: 100 },
        { subject: 'Maintenance', A: 88, B: 82, fullMark: 100 },
        { subject: 'Safety', A: 95, B: 93, fullMark: 100 },
        { subject: 'Cost', A: 75, B: 80, fullMark: 100 },
    ];

    return (
        <AppLayout>
            <Head title="Digital Twin Visualization" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <Box className="h-8 w-8 text-blue-600" />
                            Digital Twin - {equipment.name}
                        </h1>
                        <p className="text-muted-foreground">3D visualization and simulation platform</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsFullscreen(!isFullscreen)}>
                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" onClick={resetView}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset View
                        </Button>
                    </div>
                </div>

                {/* Main Visualization */}
                <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
                    <div className={isFullscreen ? 'col-span-1' : 'lg:col-span-3'}>
                        <Card className="h-[600px]">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Monitor className="h-5 w-5" />
                                        3D Visualization
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant={viewMode === '3d' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('3d')}>
                                            3D
                                        </Button>
                                        <Button
                                            variant={viewMode === 'wireframe' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('wireframe')}
                                        >
                                            Wireframe
                                        </Button>
                                        <Button variant={viewMode === 'xray' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('xray')}>
                                            X-Ray
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="h-full p-0">
                                <canvas
                                    ref={canvasRef}
                                    className="h-full w-full cursor-move"
                                    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
                                    onMouseDown={(e) => {
                                        // Handle mouse interactions for 3D navigation
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const y = e.clientY - rect.top;

                                        // Check if clicking on a component
                                        components.forEach((comp, index) => {
                                            const centerX = rect.width / 2;
                                            const centerY = rect.height / 2;
                                            const compX = centerX + comp.position.x * 50;
                                            const compY = centerY + comp.position.y * 50;
                                            const size = 20 * comp.scale.x;

                                            if (x >= compX - size / 2 && x <= compX + size / 2 && y >= compY - size / 2 && y <= compY + size / 2) {
                                                highlightComponent(comp.id);
                                            }
                                        });
                                    }}
                                />

                                {/* 3D Controls Overlay */}
                                <div className="absolute top-4 right-4 space-y-2 rounded-lg bg-black/80 p-3">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs text-white">Auto Rotate</Label>
                                        <Switch checked={autoRotate} onCheckedChange={setAutoRotate} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs text-white">Show Metrics</Label>
                                        <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-white">Zoom: {zoom.toFixed(1)}x</Label>
                                        <Slider
                                            value={[zoom]}
                                            onValueChange={([value]) => setZoom(value)}
                                            min={0.5}
                                            max={3}
                                            step={0.1}
                                            className="w-20"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {!isFullscreen && (
                        <div className="space-y-4">
                            {/* Component List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Layers className="h-4 w-4" />
                                        Components
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-60 space-y-2 overflow-y-auto">
                                        {components.map((component) => (
                                            <div
                                                key={component.id}
                                                className={`cursor-pointer rounded border p-2 transition-all ${
                                                    selectedComponent?.id === component.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                                                }`}
                                                onClick={() => highlightComponent(component.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {getComponentTypeIcon(component.type)}
                                                        <span className="text-sm font-medium">{component.name}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleComponentVisibility(component.id);
                                                        }}
                                                    >
                                                        {component.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                                <div className="mt-1 space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Health:</span>
                                                        <span className={getHealthColor(component.health)}>{component.health.toFixed(1)}%</span>
                                                    </div>
                                                    <Progress value={component.health} className="h-1" />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Temp: {component.temperature.toFixed(1)}°C</span>
                                                        <span className="capitalize">{component.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Selected Component Details */}
                            {selectedComponent && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">{selectedComponent.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground">Type:</span>
                                                <div className="font-medium capitalize">{selectedComponent.type}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Health:</span>
                                                <div className={`font-medium ${getHealthColor(selectedComponent.health)}`}>
                                                    {selectedComponent.health.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Temperature:</span>
                                                <div className="font-medium">{selectedComponent.temperature.toFixed(1)}°C</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Status:</span>
                                                <div className="font-medium">
                                                    {selectedComponent.health > 80 ? 'Good' : selectedComponent.health > 60 ? 'Fair' : 'Poor'}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedComponent.pressure && (
                                            <div>
                                                <span className="text-xs text-muted-foreground">Pressure:</span>
                                                <div className="text-sm font-medium">{selectedComponent.pressure.toFixed(1)} PSI</div>
                                            </div>
                                        )}

                                        {selectedComponent.vibration && (
                                            <div>
                                                <span className="text-xs text-muted-foreground">Vibration:</span>
                                                <div className="text-sm font-medium">{selectedComponent.vibration.toFixed(2)} mm/s</div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>

                {/* Simulation and Analysis */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Play className="h-5 w-5" />
                                Simulation Control
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Scenario Selection */}
                                <div>
                                    <Label htmlFor="scenario">Simulation Scenario</Label>
                                    <select
                                        id="scenario"
                                        className="mt-1 w-full rounded-md border p-2"
                                        value={selectedScenario?.id || ''}
                                        onChange={(e) => {
                                            const scenario = scenarios.find((s) => s.id === e.target.value);
                                            setSelectedScenario(scenario || null);
                                        }}
                                    >
                                        <option value="">Select a scenario</option>
                                        {scenarios.map((scenario) => (
                                            <option key={scenario.id} value={scenario.id}>
                                                {scenario.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedScenario && (
                                    <>
                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <h4 className="mb-2 text-sm font-medium">{selectedScenario.name}</h4>
                                            <p className="mb-3 text-xs text-muted-foreground">{selectedScenario.description}</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>Load: {selectedScenario.parameters.load}%</div>
                                                <div>Speed: {selectedScenario.parameters.speed} RPM</div>
                                                <div>Temp: {selectedScenario.parameters.temperature}°C</div>
                                                <div>Pressure: {selectedScenario.parameters.pressure} PSI</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Simulation Progress</span>
                                                <span className="text-sm">{simulationProgress.toFixed(0)}%</span>
                                            </div>
                                            <Progress value={simulationProgress} className="h-2" />
                                        </div>

                                        <Button onClick={runSimulation} disabled={isSimulating} className="w-full">
                                            {isSimulating ? (
                                                <>
                                                    <Pause className="mr-2 h-4 w-4" />
                                                    Running Simulation...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Start Simulation
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Performance Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                                        <Radar name="Current" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                        <Radar name="Optimal" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Overall Score:</span>
                                        <span className="font-medium">85/100</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Efficiency Rating:</span>
                                        <Badge variant="default">Excellent</Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Next Maintenance:</span>
                                        <span className="text-orange-600">In 15 days</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Real-time Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Real-time Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">85%</div>
                                <div className="text-sm text-muted-foreground">Efficiency</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">92°C</div>
                                <div className="text-sm text-muted-foreground">Temperature</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">45 PSI</div>
                                <div className="text-sm text-muted-foreground">Pressure</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">2.1 mm/s</div>
                                <div className="text-sm text-muted-foreground">Vibration</div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={digitalTwinData.realTimeMetrics || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                                    <YAxis />
                                    <Tooltip labelFormatter={(value) => new Date(value)} />
                                    <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="powerConsumption" stroke="#f59e0b" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default DigitalTwinVisualization;
