<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportBuilderService
{
    /**
     * Build a custom report based on provided parameters
     */
    public function buildReport(array $config): array
    {
        $query = $this->buildQuery($config);
        $data = $query->get();
        
        return [
            'data' => $data,
            'summary' => $this->generateSummary($data, $config),
            'metadata' => $this->generateMetadata($config),
        ];
    }

    /**
     * Build database query based on report configuration
     */
    protected function buildQuery(array $config): Builder
    {
        $table = $config['table'] ?? 'rentals';
        $query = DB::table($table);

        // Apply filters
        if (isset($config['filters'])) {
            foreach ($config['filters'] as $filter) {
                $this->applyFilter($query, $filter);
            }
        }

        // Apply date range
        if (isset($config['date_range'])) {
            $this->applyDateRange($query, $config['date_range']);
        }

        // Apply grouping
        if (isset($config['group_by'])) {
            $query->groupBy($config['group_by']);
        }

        // Apply ordering
        if (isset($config['order_by'])) {
            foreach ($config['order_by'] as $order) {
                $query->orderBy($order['column'], $order['direction'] ?? 'asc');
            }
        }

        // Apply limit
        if (isset($config['limit'])) {
            $query->limit($config['limit']);
        }

        return $query;
    }

    /**
     * Apply individual filter to query
     */
    protected function applyFilter(Builder $query, array $filter): void
    {
        $column = $filter['column'];
        $operator = $filter['operator'] ?? '=';
        $value = $filter['value'];

        switch ($operator) {
            case 'like':
                $query->where($column, 'like', "%{$value}%");
                break;
            case 'in':
                $query->whereIn($column, (array) $value);
                break;
            case 'between':
                $query->whereBetween($column, $value);
                break;
            case 'null':
                $query->whereNull($column);
                break;
            case 'not_null':
                $query->whereNotNull($column);
                break;
            default:
                $query->where($column, $operator, $value);
        }
    }

    /**
     * Apply date range filter to query
     */
    protected function applyDateRange(Builder $query, array $dateRange): void
    {
        $column = $dateRange['column'] ?? 'created_at';
        $start = Carbon::parse($dateRange['start']);
        $end = Carbon::parse($dateRange['end']);

        $query->whereBetween($column, [$start, $end]);
    }

    /**
     * Generate summary statistics for the report data
     */
    protected function generateSummary(Collection $data, array $config): array
    {
        $summary = [
            'total_records' => $data->count(),
            'generated_at' => now()->toISOString(),
        ];

        // Add custom summary calculations based on config
        if (isset($config['summary_fields'])) {
            foreach ($config['summary_fields'] as $field => $operations) {
                foreach ($operations as $operation) {
                    $key = "{$field}_{$operation}";
                    $summary[$key] = $this->calculateSummary($data, $field, $operation);
                }
            }
        }

        return $summary;
    }

    /**
     * Calculate summary statistic for a field
     */
    protected function calculateSummary(Collection $data, string $field, string $operation)
    {
        switch ($operation) {
            case 'sum':
                return $data->sum($field);
            case 'avg':
                return $data->avg($field);
            case 'min':
                return $data->min($field);
            case 'max':
                return $data->max($field);
            case 'count':
                return $data->where($field, '!=', null)->count();
            case 'unique':
                return $data->pluck($field)->unique()->count();
            default:
                return null;
        }
    }

    /**
     * Generate metadata for the report
     */
    protected function generateMetadata(array $config): array
    {
        return [
            'report_type' => $config['type'] ?? 'custom',
            'table' => $config['table'] ?? 'rentals',
            'filters_applied' => count($config['filters'] ?? []),
            'has_date_range' => isset($config['date_range']),
            'grouped_by' => $config['group_by'] ?? null,
            'config' => $config,
        ];
    }

    /**
     * Export report data to various formats
     */
    public function exportReport(array $data, string $format = 'csv'): string
    {
        switch ($format) {
            case 'csv':
                return $this->exportToCsv($data);
            case 'json':
                return json_encode($data, JSON_PRETTY_PRINT);
            case 'xml':
                return $this->exportToXml($data);
            default:
                throw new \InvalidArgumentException("Unsupported export format: {$format}");
        }
    }

    /**
     * Export data to CSV format
     */
    protected function exportToCsv(array $data): string
    {
        if (empty($data['data'])) {
            return '';
        }

        $output = fopen('php://temp', 'r+');
        
        // Write headers
        $headers = array_keys((array) $data['data']->first());
        fputcsv($output, $headers);
        
        // Write data rows
        foreach ($data['data'] as $row) {
            fputcsv($output, (array) $row);
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);
        
        return $csv;
    }

    /**
     * Export data to XML format
     */
    protected function exportToXml(array $data): string
    {
        $xml = new \SimpleXMLElement('<report/>');
        
        // Add metadata
        $metadata = $xml->addChild('metadata');
        foreach ($data['metadata'] as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            }
            $metadata->addChild($key, htmlspecialchars((string) $value));
        }
        
        // Add summary
        $summary = $xml->addChild('summary');
        foreach ($data['summary'] as $key => $value) {
            $summary->addChild($key, htmlspecialchars((string) $value));
        }
        
        // Add data
        $dataNode = $xml->addChild('data');
        foreach ($data['data'] as $row) {
            $rowNode = $dataNode->addChild('row');
            foreach ((array) $row as $key => $value) {
                $rowNode->addChild($key, htmlspecialchars((string) $value));
            }
        }
        
        return $xml->asXML();
    }

    /**
     * Get available report templates
     */
    public function getReportTemplates(): array
    {
        return [
            'rental_summary' => [
                'name' => 'Rental Summary Report',
                'description' => 'Overview of rental activities',
                'table' => 'rentals',
                'default_filters' => [],
                'summary_fields' => [
                    'total_amount' => ['sum', 'avg'],
                    'deposit_amount' => ['sum'],
                ],
            ],
            'equipment_utilization' => [
                'name' => 'Equipment Utilization Report',
                'description' => 'Equipment usage and availability',
                'table' => 'equipment',
                'default_filters' => [],
                'summary_fields' => [
                    'daily_rate' => ['avg', 'min', 'max'],
                ],
            ],
            'financial_overview' => [
                'name' => 'Financial Overview Report',
                'description' => 'Financial performance metrics',
                'table' => 'rentals',
                'default_filters' => [
                    ['column' => 'status', 'operator' => '=', 'value' => 'completed']
                ],
                'summary_fields' => [
                    'total_amount' => ['sum'],
                    'tax_amount' => ['sum'],
                    'subtotal' => ['sum'],
                ],
            ],
        ];
    }
} 