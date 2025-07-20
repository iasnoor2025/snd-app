<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Payslips</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
        }
        .payslip {
            page-break-after: always;
            margin-bottom: 30px;
            border: 1px solid #ddd;
            padding: 20px;
            background: white;
        }
        .payslip:last-child {
            page-break-after: avoid;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .company-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .payslip-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .period {
            font-size: 16px;
            color: #666;
        }
        .employee-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .info-section {
            flex: 1;
            min-width: 200px;
            margin: 10px;
        }
        .info-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }
        .info-value {
            color: #666;
        }
        .salary-details {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .salary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .attendance-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
        }
        .attendance-table th,
        .attendance-table td {
            border: 1px solid #ddd;
            padding: 2px;
            text-align: center;
        }
        .attendance-table th {
            background: #333;
            color: white;
            font-weight: bold;
        }
        .attendance-table .day-header {
            background: #f0f0f0;
            color: #333;
        }
        .status-8 { background: #d4edda; color: #155724; }
        .status-F { background: #cce5ff; color: #004085; }
        .status-A { background: #f8d7da; color: #721c24; }
        .status-O { background: #cce5ff; color: #004085; }
        .legend {
            margin-top: 10px;
            font-size: 11px;
        }
        .legend-item {
            display: inline-block;
            margin-right: 15px;
        }
        .legend-color {
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-right: 5px;
            border-radius: 2px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        .signature-box {
            text-align: center;
            flex: 1;
            margin: 0 10px;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 30px;
            padding-top: 5px;
        }
        @media print {
            .payslip {
                page-break-after: always;
                margin: 0;
                padding: 15px;
            }
            .payslip:last-child {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    @foreach($payrolls as $payroll)
        <div class="payslip">
            <div class="header">
                <div class="company-name">Samhan Naser Al-Dosri Est.</div>
                <div class="company-subtitle">For Gen. Contracting & Rent. Equipments</div>
                <div class="payslip-title">Payroll Payslip</div>
                <div class="period">{{ \Carbon\Carbon::createFromDate($payroll->year, $payroll->month, 1)->format('F Y') }}</div>
            </div>

            <div class="employee-info">
                <div class="info-section">
                    <div class="info-title">Employee Details</div>
                    <div class="info-value">File #: {{ $payroll->employee->file_number ?? $payroll->employee->id }}</div>
                    <div class="info-value">Name: {{ $payroll->employee->first_name }} {{ $payroll->employee->last_name }}</div>
                    <div class="info-value">Designation: {{ $payroll->employee->designation ?? 'N/A' }}</div>
                    <div class="info-value">Department: {{ $payroll->employee->department->name ?? 'N/A' }}</div>
                </div>

                <div class="info-section">
                    <div class="info-title">Pay Period</div>
                    <div class="info-value">Period: {{ \Carbon\Carbon::createFromDate($payroll->year, $payroll->month, 1)->format('F Y') }}</div>
                    <div class="info-value">Generated: {{ $payroll->created_at->format('m/d/Y') }}</div>
                    <div class="info-value">Status: {{ ucfirst($payroll->status) }}</div>
                    <div class="info-value">Payroll ID: {{ $payroll->id }}</div>
                </div>

                <div class="info-section">
                    <div class="info-title">Salary Details</div>
                    <div class="info-value">Basic: SAR {{ number_format($payroll->base_salary, 2) }}</div>
                    <div class="info-value">Overtime: SAR {{ number_format($payroll->overtime_amount, 2) }}</div>
                    <div class="info-value">Bonus: SAR {{ number_format($payroll->bonus_amount, 2) }}</div>
                    <div class="info-value">Gross: SAR {{ number_format($payroll->base_salary + $payroll->overtime_amount + $payroll->bonus_amount, 2) }}</div>
                </div>

                <div class="info-section">
                    <div class="info-title">Working Hours</div>
                    <div class="info-value">Total: {{ $payroll->total_worked_hours }}</div>
                    <div class="info-value">Regular: {{ $payroll->total_worked_hours - $payroll->overtime_hours }}</div>
                    <div class="info-value">Overtime: {{ $payroll->overtime_hours }}</div>
                    <div class="info-value">Rate: SAR {{ number_format($payroll->base_salary / max($payroll->total_worked_hours, 1), 2) }}</div>
                </div>
            </div>

            @if(isset($attendanceData[$payroll->id]))
                <div class="attendance-section">
                    <h3>Attendance Record</h3>
                    <table class="attendance-table">
                        <thead>
                            <tr>
                                @for($day = 1; $day <= \Carbon\Carbon::createFromDate($payroll->year, $payroll->month, 1)->daysInMonth; $day++)
                                    <th>{{ str_pad($day, 2, '0', STR_PAD_LEFT) }}</th>
                                @endfor
                            </tr>
                            <tr class="day-header">
                                @for($day = 1; $day <= \Carbon\Carbon::createFromDate($payroll->year, $payroll->month, 1)->daysInMonth; $day++)
                                    <th>{{ \Carbon\Carbon::createFromDate($payroll->year, $payroll->month, $day)->format('D') }}</th>
                                @endfor
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                @for($day = 1; $day <= \Carbon\Carbon::createFromDate($payroll->year, $payroll->month, 1)->daysInMonth; $day++)
                                    @php
                                        $dayData = $attendanceData[$payroll->id][$day] ?? null;
                                        $status = $dayData['status'] ?? 'A';
                                        $statusClass = 'status-' . $status;
                                    @endphp
                                    <td class="{{ $statusClass }}">{{ $status }}</td>
                                @endfor
                            </tr>
                            <tr>
                                @for($day = 1; $day <= \Carbon\Carbon::createFromDate($payroll->year, $payroll->month, 1)->daysInMonth; $day++)
                                    @php
                                        $dayData = $attendanceData[$payroll->id][$day] ?? null;
                                        $overtimeHours = $dayData['overtime_hours'] ?? 0;
                                    @endphp
                                    <td>{{ $overtimeHours > 0 ? $overtimeHours : 0 }}</td>
                                @endfor
                            </tr>
                        </tbody>
                    </table>
                    <div class="legend">
                        <span class="legend-item"><span class="legend-color" style="background: #d4edda;"></span>8 = regular hours</span>
                        <span class="legend-item"><span class="legend-color" style="background: #cce5ff;"></span>O = overtime hours</span>
                        <span class="legend-item"><span class="legend-color" style="background: #f8d7da;"></span>A = absent</span>
                        <span class="legend-item"><span class="legend-color" style="background: #cce5ff;"></span>F = Friday (weekend)</span>
                    </div>
                </div>
            @endif

            <div class="salary-details">
                <h3>Payroll Summary</h3>
                <div class="salary-row">
                    <span>Basic Salary:</span>
                    <span>SAR {{ number_format($payroll->base_salary, 2) }}</span>
                </div>
                <div class="salary-row">
                    <span>Overtime Pay:</span>
                    <span>SAR {{ number_format($payroll->overtime_amount, 2) }}</span>
                </div>
                <div class="salary-row">
                    <span>Bonus:</span>
                    <span>SAR {{ number_format($payroll->bonus_amount, 2) }}</span>
                </div>
                <div class="salary-row">
                    <span>Advance Deductions:</span>
                    <span>SAR {{ number_format($payroll->advance_deduction ?? 0, 2) }}</span>
                </div>
                <div class="salary-row" style="font-weight: bold; border-top: 1px solid #ddd; padding-top: 5px;">
                    <span>Net Pay:</span>
                    <span>SAR {{ number_format($payroll->final_amount, 2) }}</span>
                </div>
            </div>

            @if($payroll->notes)
                <div class="notes-section">
                    <h3>Notes</h3>
                    <p>{{ $payroll->notes }}</p>
                </div>
            @endif

            <div class="signature-section">
                <div class="signature-box">
                    <div>Chief-Accountant</div>
                    <div style="color: #666; font-style: italic;">Samir Taima</div>
                    <div class="signature-line">Signature</div>
                </div>
                <div class="signature-box">
                    <div>Verified By</div>
                    <div style="color: #666; font-style: italic;">Salem Samhan Al-Dosri</div>
                    <div class="signature-line">Signature</div>
                </div>
                <div class="signature-box">
                    <div>Approved By</div>
                    <div style="color: #666; font-style: italic;">Nasser Samhan Al-Dosri</div>
                    <div class="signature-line">Signature</div>
                </div>
            </div>
        </div>
    @endforeach
</body>
</html>
