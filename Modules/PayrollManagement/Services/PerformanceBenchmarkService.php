<?php

namespace Modules\PayrollManagement\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\PerformanceBenchmark;
use Illuminate\Support\Carbon;

class PerformanceBenchmarkService
{
    /**
     * Get all benchmarks with filtering
     */
    public function getBenchmarks(array $filters = [])
    {
        $query = PerformanceBenchmark::query();

        if (isset($filters['equipment_type'])) {
            $query->where('equipment_type', $filters['equipment_type']);
        }

        if (isset($filters['model'])) {
            $query->where('model', $filters['model']);
        }

        if (isset($filters['manufacturer'])) {
            $query->where('manufacturer', $filters['manufacturer']);
        }

        if (isset($filters['metric_name'])) {
            $query->where('metric_name', $filters['metric_name']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $limit = $filters['limit'] ?? 50;
        return $query->paginate($limit);
    }

    /**
     * Create a new benchmark
     */
    public function createBenchmark(array $data)
    {
        $data['created_by'] = Auth::id();
        $data['updated_by'] = Auth::id();
        $data['is_active'] = $data['is_active'] ?? true;

        return PerformanceBenchmark::create($data);
    }

    /**
     * Update a benchmark
     */
    public function updateBenchmark(int $id, array $data)
    {
        $benchmark = PerformanceBenchmark::findOrFail($id);
        $data['updated_by'] = Auth::id();

        $benchmark->update($data);
        return $benchmark->fresh();
    }

    /**
     * Delete a benchmark
     */
    public function deleteBenchmark(int $id)
    {
        $benchmark = PerformanceBenchmark::findOrFail($id);
        return $benchmark->delete();
    }

    /**
     * Get benchmark by ID
     */
    public function getBenchmark(int $id)
    {
        return PerformanceBenchmark::findOrFail($id);
    }

    /**
     * Bulk create benchmarks
     */
    public function bulkCreateBenchmarks(array $benchmarks)
    {
        $createdBenchmarks = [];
        $userId = Auth::id();

        foreach ($benchmarks as $benchmarkData) {
            $benchmarkData['created_by'] = $userId;
            $benchmarkData['updated_by'] = $userId;
            $benchmarkData['is_active'] = $benchmarkData['is_active'] ?? true;

            $createdBenchmarks[] = PerformanceBenchmark::create($benchmarkData);
        }

        return $createdBenchmarks;
    }

    /**
     * Get benchmarks for a specific equipment
     */
    public function getBenchmarksForEquipment(Equipment $equipment)
    {
        return PerformanceBenchmark::active()
            ->where(function ($query) use ($equipment) {
                // Match by specific equipment type, model, and manufacturer
                $query->where(function ($q) use ($equipment) {
                    $q->where('equipment_type', $equipment->type)
                      ->where('model', $equipment->model)
                      ->where('manufacturer', $equipment->manufacturer);
                })
                // Or match by equipment type and model only
                ->orWhere(function ($q) use ($equipment) {
                    $q->where('equipment_type', $equipment->type)
                      ->where('model', $equipment->model)
                      ->whereNull('manufacturer');
                })
                // Or match by equipment type and manufacturer only
                ->orWhere(function ($q) use ($equipment) {
                    $q->where('equipment_type', $equipment->type)
                      ->whereNull('model')
                      ->where('manufacturer', $equipment->manufacturer);
                })
                // Or match by equipment type only
                ->orWhere(function ($q) use ($equipment) {
                    $q->where('equipment_type', $equipment->type)
                      ->whereNull('model')
                      ->whereNull('manufacturer');
                });
            })
            ->get();
    }

    /**
     * Compare equipment performance with benchmarks
     */
    public function compareWithBenchmarks(Equipment $equipment, array $performanceData)
    {
        $benchmarks = $this->getBenchmarksForEquipment($equipment);
        $comparison = [];

        foreach ($benchmarks as $benchmark) {
            $actualValue = $performanceData[$benchmark->metric_name] ?? null;

            if ($actualValue !== null) {
                $comparison[$benchmark->metric_name] = [
                    'benchmark' => $benchmark,
                    'actual_value' => $actualValue,
                    'unit' => $benchmark->unit_of_measure,
                    'is_within_range' => $this->isWithinRange($actualValue, $benchmark),
                    'performance_status' => $this->getPerformanceStatus($actualValue, $benchmark),
                ];
            }
        }

        return $comparison;
    }

    /**
     * Check if value is within benchmark range
     */
    private function isWithinRange($value, PerformanceBenchmark $benchmark)
    {
        if ($benchmark->expected_min_value !== null && $value < $benchmark->expected_min_value) {
            return false;
        }

        if ($benchmark->expected_max_value !== null && $value > $benchmark->expected_max_value) {
            return false;
        }

        return true;
    }

    /**
     * Get performance status
     */
    private function getPerformanceStatus($value, PerformanceBenchmark $benchmark)
    {
        if ($benchmark->optimal_value !== null) {
            $tolerance = ($benchmark->expected_max_value - $benchmark->expected_min_value) * 0.1;

            if (abs($value - $benchmark->optimal_value) <= $tolerance) {
                return 'optimal';
            }
        }

        if ($this->isWithinRange($value, $benchmark)) {
            return 'acceptable';
        }

        return 'below_standard';
    }

    /**
     * Get benchmark statistics
     */
    public function getBenchmarkStatistics()
    {
        $stats = [
            'total_benchmarks' => PerformanceBenchmark::count(),
            'active_benchmarks' => PerformanceBenchmark::where('is_active', true)->count(),
            'equipment_types' => PerformanceBenchmark::distinct('equipment_type')->count(),
            'metrics' => PerformanceBenchmark::distinct('metric_name')->count(),
        ];

        return $stats;
    }

    /**
     * Get unique equipment types
     */
    public function getEquipmentTypes()
    {
        return PerformanceBenchmark::distinct('equipment_type')
            ->pluck('equipment_type')
            ->filter()
            ->values();
    }

    /**
     * Get unique metric names
     */
    public function getMetricNames()
    {
        return PerformanceBenchmark::distinct('metric_name')
            ->pluck('metric_name')
            ->filter()
            ->values();
    }

    /**
     * Get unique manufacturers
     */
    public function getManufacturers()
    {
        return PerformanceBenchmark::distinct('manufacturer')
            ->pluck('manufacturer')
            ->filter()
            ->values();
    }
}
