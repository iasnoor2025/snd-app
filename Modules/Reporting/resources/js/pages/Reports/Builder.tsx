import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Core';
import AppLayout from '@/Core/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface BuilderProps {
    templates: any[];
    dataSources: string[];
    columns: Record<string, string[]>;
    aggregationFunctions: string[];
    filterOperators: string[];
    visualizationTypes: string[];
    exportFormats: string[];
    scheduleFrequencies: string[];
    daysOfWeek: string[];
    daysOfMonth: string[];
    times: string[];
    recipients: any[];
}

interface Filter {
    column: string;
    operator: string;
    value: string;
}

export default function Builder(props: BuilderProps) {
    const [dataSource, setDataSource] = useState('');
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [aggregation, setAggregation] = useState('');
    const [filters, setFilters] = useState<Filter[]>([]);
    const [visualization, setVisualization] = useState('table');
    const [exportFormat, setExportFormat] = useState('csv');
    const [schedule, setSchedule] = useState({ frequency: 'once', day: '', time: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const availableColumns = dataSource ? props.columns[dataSource] || [] : [];

    const addFilter = () => setFilters([...filters, { column: '', operator: '=', value: '' }]);
    const updateFilter = (idx: number, key: keyof Filter, value: string) => {
        setFilters(filters.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));
    };
    const removeFilter = (idx: number) => setFilters(filters.filter((_, i) => i !== idx));

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await fetch('/reporting/builder/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    data_source: dataSource,
                    columns: selectedColumns,
                    filters,
                    aggregations: aggregation ? [aggregation] : [],
                    visualization_type: visualization,
                    export_format: exportFormat,
                    schedule,
                }),
            });
            const data = await response.json();
            if (!response.ok || data.success === false) {
                setError(data.message || 'Failed to generate report');
            } else {
                setResult(data);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Custom Report Builder" />
            <div className="container mx-auto py-6">
                <div className="mb-4">
                    <a
                        href="/reporting"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Reports
                    </a>
                </div>
                <div className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold">Custom Report Builder</h1>
                    <p className="mb-4 text-muted-foreground">Build custom reports from any data source.</p>
                </div>
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Report Builder</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Data Source Select */}
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Data Source</label>
                            <Select value={dataSource} onValueChange={setDataSource}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select data source" />
                                </SelectTrigger>
                                <SelectContent>
                                    {props.dataSources.map((src) => (
                                        <SelectItem key={src} value={src}>
                                            {src.split('\\').pop()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Columns Multi-Select */}
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Columns</label>
                            <div className="flex flex-wrap gap-2">
                                {availableColumns.map((col) => (
                                    <Button
                                        key={col}
                                        variant={selectedColumns.includes(col) ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() =>
                                            setSelectedColumns(
                                                selectedColumns.includes(col) ? selectedColumns.filter((c) => c !== col) : [...selectedColumns, col],
                                            )
                                        }
                                    >
                                        {col}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        {/* Aggregation Function */}
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Aggregation</label>
                            <Select value={aggregation} onValueChange={setAggregation}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select aggregation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {props.aggregationFunctions.map((fn) => (
                                        <SelectItem key={fn} value={fn}>
                                            {fn}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Filter Builder */}
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Filters</label>
                            {filters.map((filter, idx) => (
                                <div key={idx} className="mb-2 flex items-center gap-2">
                                    <Select value={filter.column} onValueChange={(v) => updateFilter(idx, 'column', v)}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableColumns.map((col) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={filter.operator} onValueChange={(v) => updateFilter(idx, 'operator', v)}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue placeholder="Operator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {props.filterOperators.map((op) => (
                                                <SelectItem key={op} value={op}>
                                                    {op}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        className="w-32"
                                        value={filter.value}
                                        onChange={(e) => updateFilter(idx, 'value', e.target.value)}
                                        placeholder="Value"
                                    />
                                    <Button variant="destructive" size="icon" onClick={() => removeFilter(idx)}>
                                        -
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addFilter}>
                                + Add Filter
                            </Button>
                        </div>
                        {/* Visualization Type */}
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Visualization</label>
                            <Select value={visualization} onValueChange={setVisualization}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select visualization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {props.visualizationTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Export Format */}
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Export Format</label>
                            <Select value={exportFormat} onValueChange={setExportFormat}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    {props.exportFormats.map((fmt) => (
                                        <SelectItem key={fmt} value={fmt}>
                                            {fmt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Schedule Options */}
                        <div className="mb-4">
                            <label className="mb-1 block font-medium">Schedule</label>
                            <Select value={schedule.frequency} onValueChange={(v) => setSchedule((s) => ({ ...s, frequency: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {props.scheduleFrequencies.map((freq) => (
                                        <SelectItem key={freq} value={freq}>
                                            {freq}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {schedule.frequency === 'weekly' && (
                                <Select value={schedule.day} onValueChange={(v) => setSchedule((s) => ({ ...s, day: v }))}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Day of Week" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {props.daysOfWeek.map((d) => (
                                            <SelectItem key={d} value={d}>
                                                {d}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {schedule.frequency === 'monthly' && (
                                <Select value={schedule.day} onValueChange={(v) => setSchedule((s) => ({ ...s, day: v }))}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Day of Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {props.daysOfMonth.map((d) => (
                                            <SelectItem key={d.toString()} value={d.toString()}>
                                                {d}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Select value={schedule.time} onValueChange={(v) => setSchedule((s) => ({ ...s, time: v }))}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {props.times.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="mt-4" onClick={handleGenerate} disabled={loading || !dataSource || selectedColumns.length === 0}>
                            {loading ? 'Generating...' : 'Generate Report'}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Current Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                            {JSON.stringify({ dataSource, selectedColumns, aggregation, filters, visualization, exportFormat, schedule }, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
                {error && (
                    <Card className="mt-8 border-red-500">
                        <CardHeader>
                            <CardTitle>Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-red-600">{error}</div>
                        </CardContent>
                    </Card>
                )}
                {result && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Report Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {result.data && Array.isArray(result.data) && result.data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                {Object.keys(result.data[0]).map((col) => (
                                                    <th key={col} className="px-4 py-2 text-left">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                            {result.data.map((row: any, idx: number) => (
                                                <tr key={idx}>
                                                    {Object.values(row).map((val, i) => (
                                                        <td key={i} className="px-4 py-2">
                                                            {String(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(result, null, 2)}</pre>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
