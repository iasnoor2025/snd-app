<?php

namespace Modules\EmployeeManagement\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Modules\EmployeeManagement\Models\Employee;
use Illuminate\Support\Facades\Cache;

class EmployeeSearchService
{
    /**
     * Search employees with advanced filters
     */
    public function search(array $filters, array $options = []): Collection
    {
        $query = Employee::query();
        
        // Apply basic filters
        $this->applyBasicFilters($query, $filters);
        
        // Apply document filters
        if (isset($filters['documents'])) {
            $this->applyDocumentFilters($query, $filters['documents']);
        }
        
        // Apply date range filters
        if (isset($filters['date_ranges'])) {
            $this->applyDateRangeFilters($query, $filters['date_ranges']);
        }
        
        // Apply relationship filters
        if (isset($filters['relationships'])) {
            $this->applyRelationshipFilters($query, $filters['relationships']);
        }
        
        // Apply sorting
        if (isset($options['sort'])) {
            $this->applySorting($query, $options['sort']);
        }
        
        // Cache results if enabled
        if (isset($options['cache']) && $options['cache']) {
            $cacheKey = $this->generateCacheKey($filters, $options);
            return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($query) {
                return $query->get();
            });
        }
        
        return $query->get();
    }

    /**
     * Apply basic filters to the query
     */
    protected function applyBasicFilters(Builder $query, array $filters): void
    {
        // Name search
        if (isset($filters['name'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('first_name', 'like', "%{$filters['name']}%")
                    ->orWhere('last_name', 'like', "%{$filters['name']}%");
            });
        }
        
        // Employee ID search
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', 'like', "%{$filters['employee_id']}%");
        }
        
        // Department filter
        if (isset($filters['department'])) {
            $query->where('department', $filters['department']);
        }
        
        // Position filter
        if (isset($filters['position'])) {
            $query->where('position', $filters['position']);
        }
        
        // Status filter
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        // Employment type filter
        if (isset($filters['employment_type'])) {
            $query->where('employment_type', $filters['employment_type']);
        }
        
        // Location filter
        if (isset($filters['location'])) {
            $query->where('location', $filters['location']);
        }
    }

    /**
     * Apply document-related filters
     */
    protected function applyDocumentFilters(Builder $query, array $documentFilters): void
    {
        foreach ($documentFilters as $type => $filter) {
            $query->whereHas('documents', function ($q) use ($type, $filter) {
                $q->where('type', $type);
                
                if (isset($filter['status'])) {
                    $q->where('status', $filter['status']);
                }
                
                if (isset($filter['expiry'])) {
                    if ($filter['expiry'] === 'expired') {
                        $q->where('expiry_date', '<', now());
                    } elseif ($filter['expiry'] === 'expiring_soon') {
                        $q->where('expiry_date', '<=', now()->addDays(30))
                            ->where('expiry_date', '>', now());
                    }
                }
            });
        }
    }

    /**
     * Apply date range filters
     */
    protected function applyDateRangeFilters(Builder $query, array $dateRanges): void
    {
        foreach ($dateRanges as $field => $range) {
            if (isset($range['from'])) {
                $query->where($field, '>=', $range['from']);
            }
            
            if (isset($range['to'])) {
                $query->where($field, '<=', $range['to']);
            }
        }
    }

    /**
     * Apply relationship filters
     */
    protected function applyRelationshipFilters(Builder $query, array $relationships): void
    {
        // Department relationship
        if (isset($relationships['department'])) {
            $query->whereHas('department', function ($q) use ($relationships) {
                $q->where('name', $relationships['department']);
            });
        }
        
        // Position relationship
        if (isset($relationships['position'])) {
            $query->whereHas('position', function ($q) use ($relationships) {
                $q->where('name', $relationships['position']);
            });
        }
        
        // Manager relationship
        if (isset($relationships['manager'])) {
            $query->whereHas('manager', function ($q) use ($relationships) {
                $q->where('id', $relationships['manager']);
            });
        }
    }

    /**
     * Apply sorting to the query
     */
    protected function applySorting(Builder $query, array $sort): void
    {
        $field = $sort['field'] ?? 'created_at';
        $direction = $sort['direction'] ?? 'desc';
        
        $query->orderBy($field, $direction);
    }

    /**
     * Generate a cache key for the search
     */
    protected function generateCacheKey(array $filters, array $options): string
    {
        $key = 'employee_search:';
        $key .= md5(json_encode($filters));
        $key .= ':' . md5(json_encode($options));
        return $key;
    }

    /**
     * Get saved searches for a user
     */
    public function getSavedSearches(int $userId): Collection
    {
        return Cache::get("user:{$userId}:saved_searches", collect());
    }

    /**
     * Save a search for a user
     */
    public function saveSearch(int $userId, string $name, array $filters, array $options = []): void
    {
        $savedSearches = $this->getSavedSearches($userId);
        
        $savedSearches->push([
            'name' => $name,
            'filters' => $filters,
            'options' => $options,
            'created_at' => now(),
        ]);
        
        Cache::put("user:{$userId}:saved_searches", $savedSearches, now()->addMonths(6));
    }

    /**
     * Delete a saved search
     */
    public function deleteSavedSearch(int $userId, string $name): void
    {
        $savedSearches = $this->getSavedSearches($userId);
        
        $savedSearches = $savedSearches->reject(function ($search) use ($name) {
            return $search['name'] === $name;
        });
        
        Cache::put("user:{$userId}:saved_searches", $savedSearches, now()->addMonths(6));
    }

    /**
     * Export search results
     */
    public function exportSearchResults(array $filters, array $options = [], string $format = 'csv'): string
    {
        $results = $this->search($filters, $options);
        
        switch ($format) {
            case 'csv':
                return $this->exportToCsv($results);
            case 'excel':
                return $this->exportToExcel($results);
            case 'pdf':
                return $this->exportToPdf($results);
            default:
                throw new \InvalidArgumentException("Unsupported export format: {$format}");
        }
    }

    /**
     * Export results to CSV
     */
    protected function exportToCsv(Collection $results): string
    {
        $headers = [
            'Employee ID',
            'First Name',
            'Last Name',
            'Department',
            'Position',
            'Status',
            'Employment Type',
            'Location',
            'Join Date',
        ];
        
        $rows = $results->map(function ($employee) {
            return [
                $employee->employee_id,
                $employee->first_name,
                $employee->last_name,
                $employee->department,
                $employee->position,
                $employee->status,
                $employee->employment_type,
                $employee->location,
                $employee->join_date->format('Y-m-d'),
            ];
        });
        
        $csv = fopen('php://temp', 'r+');
        fputcsv($csv, $headers);
        
        foreach ($rows as $row) {
            fputcsv($csv, $row);
        }
        
        rewind($csv);
        $content = stream_get_contents($csv);
        fclose($csv);
        
        return $content;
    }

    /**
     * Export results to Excel
     */
    protected function exportToExcel(Collection $results): string
    {
        // Implementation would use a library like PhpSpreadsheet
        throw new \RuntimeException('Excel export not implemented');
    }

    /**
     * Export results to PDF
     */
    protected function exportToPdf(Collection $results): string
    {
        // Implementation would use a library like DOMPDF
        throw new \RuntimeException('PDF export not implemented');
    }
}