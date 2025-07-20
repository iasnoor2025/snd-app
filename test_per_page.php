<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Modules\PayrollManagement\Http\Controllers\PayrollController;
use Modules\PayrollManagement\Models\Payroll;
use Modules\EmployeeManagement\Models\Employee;

// Simulate a request with per_page parameter
$request = new Request();
$request->merge([
    'per_page' => '15',
    'month' => '2024-12',
    'status' => '',
    'employee_id' => ''
]);

echo "Testing PayrollController with per_page=15\n";
echo "Request parameters: " . json_encode($request->all()) . "\n";

// Test the per_page extraction
$perPage = $request->get('per_page', 10);
echo "Extracted per_page: " . $perPage . "\n";

// Test pagination
$query = Payroll::with(['employee', 'approver', 'payer']);
$payrolls = $query->latest()->paginate($perPage);

echo "Pagination meta: " . json_encode($payrolls->toArray()) . "\n";
echo "Per page in meta: " . $payrolls->perPage() . "\n";
echo "Total records: " . $payrolls->total() . "\n";
echo "Current page: " . $payrolls->currentPage() . "\n";

?>
