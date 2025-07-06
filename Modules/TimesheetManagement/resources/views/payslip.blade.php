@php /** @var \Modules\TimesheetManagement\Http\Controllers\TimesheetController $employee, $month, $year, $start_date, $end_date, $calendar, $salary_details, $absent_days, $days_worked, $total_regular_hours, $total_overtime_hours, $total_hours */ @endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Payslip</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; color: #222; }
        .container { max-width: 900px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 8px; }
        .header { border-bottom: 2px solid #4472C4; margin-bottom: 24px; padding-bottom: 12px; }
        .company { color: #4472C4; font-size: 1.5em; font-weight: bold; }
        .subtitle { color: #4472C4; font-size: 1em; }
        .title { color: #4472C4; font-size: 1.2em; font-weight: bold; margin-top: 12px; }
        .row { display: flex; gap: 24px; margin-bottom: 16px; }
        .col { flex: 1; }
        .section { margin-bottom: 24px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .table th, .table td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; font-size: 0.95em; }
        .table th { background: #2F5496; color: #fff; }
        .absent { background: #FF0000; color: #fff; }
        .friday { background: #92D050; }
        .summary { background: #f9f9f9; border-radius: 6px; padding: 12px; }
        .footer { display: flex; justify-content: space-between; margin-top: 32px; }
        .signature { border-top: 1px solid #aaa; margin-top: 32px; padding-top: 4px; text-align: center; font-size: 0.95em; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <div class="company">Samhan Naser Al-Dosri Est.</div>
        <div class="subtitle">For Gen. Contracting & Rent. Equipments</div>
        <div class="title">Employee Pay Slip - {{ $month }} {{ $year }}</div>
    </div>
    <div class="section row">
        <div class="col">
            <strong>Employee:</strong> {{ $employee->first_name }} {{ $employee->last_name }}<br>
            <strong>File #:</strong> {{ $employee->employee_id ?? '-' }}<br>
            <strong>Position:</strong> {{ $employee->position ?? '-' }}<br>
            <strong>ID:</strong> {{ $employee->id }}
        </div>
        <div class="col">
            <strong>Date Range:</strong> {{ $start_date }} to {{ $end_date }}<br>
            <strong>Month:</strong> {{ $month }} {{ $year }}<br>
            <strong>Days Worked:</strong> {{ $days_worked }}<br>
            <strong>Absent Days:</strong> {{ $absent_days }}
        </div>
        <div class="col">
            <strong>Basic Salary:</strong> SAR {{ number_format($salary_details['basic_salary'], 2) }}<br>
            <strong>Allowances:</strong> SAR {{ number_format($salary_details['total_allowances'], 2) }}<br>
            <strong>Absent Deduction:</strong> SAR {{ number_format($salary_details['absent_deduction'], 2) }}<br>
            <strong>Overtime Pay:</strong> SAR {{ number_format($salary_details['overtime_pay'], 2) }}<br>
            <strong>Advance:</strong> SAR {{ number_format($salary_details['advance_payment'], 2) }}<br>
            <strong>Net Salary:</strong> SAR {{ number_format($salary_details['net_salary'], 2) }}
        </div>
    </div>
    <div class="section">
        <table class="table">
            <thead>
            <tr>
                <th>Day</th>
                @for ($i = 1; $i <= 31; $i++)
                    <th>{{ str_pad($i, 2, '0', STR_PAD_LEFT) }}</th>
                @endfor
            </tr>
            </thead>
            <tbody>
            <tr>
                <td><strong>Attendance</strong></td>
                @for ($i = 1; $i <= 31; $i++)
                    @php
                        $date = sprintf('%s-%02d-%02d', $year, $month, $i);
                        $dayData = $calendar[$date] ?? null;
                        $dayName = date('D', strtotime($date));
                        $isFriday = $dayName === 'Fri';
                    @endphp
                    <td class="{{ $isFriday ? 'friday' : '' }}{{ $dayData && $dayData['regular_hours'] == 0 && $dayData['overtime_hours'] == 0 && !$isFriday ? ' absent' : '' }}">
                        @if ($isFriday)
                            F
                        @elseif ($dayData && $dayData['regular_hours'] == 0 && $dayData['overtime_hours'] == 0)
                            A
                        @elseif ($dayData)
                            {{ $dayData['regular_hours'] }}
                        @else
                            -
                        @endif
                    </td>
                @endfor
            </tr>
            <tr>
                <td><strong>Overtime</strong></td>
                @for ($i = 1; $i <= 31; $i++)
                    @php
                        $date = sprintf('%s-%02d-%02d', $year, $month, $i);
                        $dayData = $calendar[$date] ?? null;
                        $dayName = date('D', strtotime($date));
                        $isFriday = $dayName === 'Fri';
                    @endphp
                    <td class="{{ $isFriday ? 'friday' : '' }}">
                        {{ $dayData && $dayData['overtime_hours'] > 0 ? $dayData['overtime_hours'] : '0' }}
                    </td>
                @endfor
            </tr>
            </tbody>
        </table>
    </div>
    <div class="section row summary">
        <div class="col">
            <strong>Total Hours:</strong> {{ $total_hours }}<br>
            <strong>Absent Hours:</strong> {{ ($absent_days * 8) }}<br>
            <strong>Overtime Hours:</strong> {{ $total_overtime_hours }}
        </div>
        <div class="col">
            <strong>Net Salary:</strong> SAR {{ number_format($salary_details['net_salary'], 2) }}<br>
            <strong>Advance:</strong> SAR {{ number_format($salary_details['advance_payment'], 2) }}
        </div>
    </div>
    <div class="footer">
        <div class="signature">Chief-Accountant<br>Signature</div>
        <div class="signature">Verified By<br>Signature</div>
        <div class="signature">Approved By<br>Signature</div>
    </div>
</div>
</body>
</html>
