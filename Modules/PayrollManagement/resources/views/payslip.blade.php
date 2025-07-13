<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payslip</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; }
        .header { text-align: center; margin-bottom: 20px; }
        .section { margin-bottom: 16px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .table th, .table td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        .table th { background: #f5f5f5; }
        .totals { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Payslip</h2>
        <div>{{ config('app.name') }}</div>
        <div>{{ now()->format('Y-m-d') }}</div>
    </div>
    <div class="section">
        <strong>Employee:</strong> {{ $employee->full_name ?? $employee->name }}<br>
        <strong>Employee ID:</strong> {{ $employee->employee_id ?? $employee->id }}<br>
        <strong>Department:</strong> {{ $employee->department->name ?? 'N/A' }}<br>
        <strong>Designation:</strong> {{ $employee->designation->title ?? 'N/A' }}<br>
    </div>
    <div class="section">
        <table class="table">
            <tr><th>Description</th><th>Amount</th></tr>
            <tr><td>Base Salary</td><td>{{ number_format($payroll->base_salary, 2) }}</td></tr>
            <tr><td>Overtime</td><td>{{ number_format($payroll->overtime_amount, 2) }}</td></tr>
            <tr><td>Bonus</td><td>{{ number_format($payroll->bonus_amount, 2) }}</td></tr>
            <tr><td>Allowances</td><td>{{ number_format($payroll->allowances ?? 0, 2) }}</td></tr>
            <tr><td>Deductions</td><td>-{{ number_format($payroll->deduction_amount, 2) }}</td></tr>
            <tr class="totals"><td>Net Pay</td><td>{{ number_format($payroll->final_amount, 2) }}</td></tr>
        </table>
    </div>
    <div class="section">
        <strong>Notes:</strong> {{ $payroll->notes ?? 'N/A' }}
    </div>
</body>
</html>
