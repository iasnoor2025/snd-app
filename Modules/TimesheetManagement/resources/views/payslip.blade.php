@php /** @var \Modules\TimesheetManagement\Http\Controllers\TimesheetController $employee, $month, $year, $start_date, $end_date, $calendar, $salary_details, $absent_days, $days_worked, $total_regular_hours, $total_overtime_hours, $total_hours, $location, $month_name, $assignment_type, $assignment_name, $assignment_location */ @endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Payslip</title>
    <style>
        @page { size: A4 landscape; margin: 10mm; }
        html, body { width: 100%; height: 100%; }
        body { font-family: DejaVu Sans, Arial, sans-serif; color: #222; background: #fff; }
        .container { width: 100%; margin: 0 auto; padding: 24px; border-radius: 16px; box-shadow: 0 2px 8px #0001; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #4472C4; padding-bottom: 16px; margin-bottom: 24px; }
        .logo-box { display: flex; align-items: center; gap: 16px; }
        .logo-img { width: 64px; height: 64px; object-fit: contain; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
        .company-name { color: #4472C4; font-size: 1.5em; font-weight: bold; }
        .company-subtitle { color: #4472C4; font-size: 1em; }
        .pay-slip-title { color: #4472C4; font-size: 1.2em; font-weight: bold; margin-top: 8px; }
        .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 16px; }
        .summary-card { background: #fff; border-radius: 8px; padding: 12px; border: 1px solid #e5e7eb; min-height: 120px; }
        .summary-title { font-size: 1.1em; font-weight: 600; margin-bottom: 8px; color: #222; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.98em; margin-bottom: 4px; }
        .summary-label { color: #6b7280; }
        .summary-value { font-weight: 600; color: #222; }
        .summary-value-green { color: #15803d; font-weight: 700; }
        .summary-value-red { color: #dc2626; font-weight: 700; }
        .attendance-section { margin-bottom: 24px; }
        .attendance-title { font-size: 1.1em; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .calendar-table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; margin-bottom: 8px; }
        .calendar-table th, .calendar-table td { border: 1px solid #e5e7eb; padding: 6px 0; text-align: center; font-size: 0.95em; }
        .calendar-table th { background: #111827; color: #fff; font-weight: bold; height: 36px; }
        .calendar-table td { background: #fff; }
        .calendar-table .friday { background: #B4C6E7; }
        .calendar-table .absent { background: #dc2626; color: #fff; }
        .calendar-table .regular { color: #15803d; font-weight: 600; }
        .calendar-table .overtime { color: #2563eb; font-weight: 600; }
        .calendar-table .day-label { color: #6b7280; font-size: 0.9em; }
        .calendar-table .rounded-l-md { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
        .calendar-table .rounded-r-md { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
        .calendar-legend { font-size: 0.95em; color: #6b7280; margin-bottom: 8px; }
        .summary-section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        .summary-box { background: #f9f9f9; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb; }
        .summary-box .label { font-weight: 500; }
        .summary-box .value { font-weight: 700; text-align: right; }
        .summary-box .value-green { color: #15803d; }
        .summary-box .value-red { color: #dc2626; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; gap: 32px; }
        .signature-block { text-align: center; flex: 1; }
        .signature-label { font-weight: 600; margin-bottom: 4px; }
        .signature-line { border-top: 1px solid #aaa; margin-top: 32px; padding-top: 4px; font-size: 0.95em; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <div class="logo-box">
            <img src="{{ public_path('snd logo.png') }}" alt="SND Logo" class="logo-img" />
            <div>
                <div class="company-name">Samhan Naser Al-Dosri Est.</div>
                <div class="company-subtitle">For Gen. Contracting & Rent. Equipments</div>
            </div>
        </div>
        <div class="text-right">
            <div class="pay-slip-title">Employee Pay Slip - {{ $month_name ?? ($month . ' ' . $year) }}</div>
            <div style="color: #6b7280; font-size: 1em;">{{ $month_name ?? ($month . ' ' . $year) }}</div>
        </div>
    </div>
    <div class="summary-grid">
        <div class="summary-card">
            <div class="summary-title">employee_details</div>
            <div class="summary-row"><span class="summary-label">File #:</span><span class="summary-value">{{ $employee->employee_id ?? '-' }}</span></div>
            <div class="summary-row"><span class="summary-label">Name:</span><span class="summary-value">{{ strtoupper($employee->first_name . ' ' . $employee->last_name) }}</span></div>
            <div class="summary-row"><span class="summary-label">Designation:</span><span class="summary-value">{{ $employee->designation ?? '-' }}</span></div>
            <div class="summary-row"><span class="summary-label">ID:</span><span class="summary-value">{{ $employee->id }}</span></div>
        </div>
        <div class="summary-card">
            <div class="summary-title">work_details</div>
            <div class="summary-row"><span class="summary-label">Type:</span><span class="summary-value">{{ ucfirst($assignment_type ?? '-') }}</span></div>
            <div class="summary-row"><span class="summary-label">Name:</span><span class="summary-value">{{ ucfirst($assignment_name ?? '-') }}</span></div>
            <div class="summary-row"><span class="summary-label">Location:</span><span class="summary-value">{{ ucfirst($assignment_location ?? '-') }}</span></div>
            <div class="summary-row"><span class="summary-label">Date Range:</span><span class="summary-value">{{ $start_date }} - {{ $end_date }}</span></div>
            <div class="summary-row"><span class="summary-label">Month:</span><span class="summary-value">{{ $month_name ?? ($month . ' ' . $year) }}</span></div>
        </div>
        <div class="summary-card">
            <div class="summary-title">salary_details</div>
            <div class="summary-row"><span class="summary-label">Basic:</span><span class="summary-value summary-value-green">SAR {{ number_format($salary_details['basic_salary'], 2) }}</span></div>
            <div class="summary-row"><span class="summary-label">Food:</span><span class="summary-value">{{ number_format($employee->food_allowance ?? 0, 2) ?: '-' }}</span></div>
            <div class="summary-row"><span class="summary-label">Housing:</span><span class="summary-value">{{ number_format($employee->housing_allowance ?? 0, 2) ?: '-' }}</span></div>
            <div class="summary-row"><span class="summary-label">Transport:</span><span class="summary-value">{{ number_format($employee->transport_allowance ?? 0, 2) ?: '-' }}</span></div>
        </div>
        <div class="summary-card">
            <div class="summary-title">working_hours</div>
            <div class="summary-row"><span class="summary-label">Contract:</span><span class="summary-value">176</span></div>
            <div class="summary-row"><span class="summary-label">Total:</span><span class="summary-value">{{ $total_hours }}</span></div>
            <div class="summary-row"><span class="summary-label">Regular:</span><span class="summary-value">{{ $total_regular_hours }}</span></div>
            <div class="summary-row"><span class="summary-label">OT:</span><span class="summary-value">{{ $total_overtime_hours }}</span></div>
        </div>
        <div class="summary-card">
            <div class="summary-title">other_details</div>
            <div class="summary-row"><span class="summary-label">Advance:</span><span class="summary-value summary-value-red">{{ number_format($employee->advance_payment ?? 0, 2) ?: '0' }}</span></div>
            <div class="summary-row"><span class="summary-label">Days Worked:</span><span class="summary-value">{{ $days_worked }}</span></div>
            <div class="summary-row"><span class="summary-label">Absent Days:</span><span class="summary-value summary-value-red">{{ $absent_days }}</span></div>
        </div>
    </div>
    <div class="attendance-section">
        <div class="attendance-title">attendance_record</div>
        <table class="calendar-table">
            <thead>
            <tr>
                @for ($i = 1; $i <= 31; $i++)
                    <th class="{{ $i === 1 ? 'rounded-l-md' : '' }}{{ $i === 31 ? 'rounded-r-md' : '' }}">{{ str_pad($i, 2, '0', STR_PAD_LEFT) }}</th>
                @endfor
            </tr>
            <tr>
                @for ($i = 1; $i <= 31; $i++)
                    @php
                        $date = sprintf('%s-%02d-%02d', $year, $month, $i);
                        $dayName = date('D', strtotime($date));
                    @endphp
                    <th class="day-label">{{ strtoupper(substr($dayName,0,1)) }}</th>
                @endfor
            </tr>
            </thead>
            <tbody>
            <tr>
                @for ($i = 1; $i <= 31; $i++)
                    @php
                        $date = sprintf('%s-%02d-%02d', $year, $month, $i);
                        $dayData = $calendar[$date] ?? null;
                        $dayName = date('D', strtotime($date));
                        $isFriday = $dayName === 'Fri';
                        $isAbsent = $dayData && $dayData['regular_hours'] == 0 && $dayData['overtime_hours'] == 0 && !$isFriday;
                    @endphp
                    <td class="{{ $isFriday ? 'friday' : '' }}{{ $isAbsent ? ' absent' : '' }}">
                        @if ($isFriday)
                            F
                        @elseif ($isAbsent)
                            A
                        @elseif ($dayData)
                            <span class="regular">{{ $dayData['regular_hours'] }}</span>
                        @else
                            -
                        @endif
                    </td>
                @endfor
            </tr>
            <tr>
                @for ($i = 1; $i <= 31; $i++)
                    @php
                        $date = sprintf('%s-%02d-%02d', $year, $month, $i);
                        $dayData = $calendar[$date] ?? null;
                        $dayName = date('D', strtotime($date));
                        $isFriday = $dayName === 'Fri';
                    @endphp
                    <td class="{{ $isFriday ? 'friday' : '' }}">
                        <span class="overtime">{{ $dayData && $dayData['overtime_hours'] > 0 ? $dayData['overtime_hours'] : '0' }}</span>
                    </td>
                @endfor
            </tr>
            </tbody>
        </table>
        <div class="calendar-legend">
            <span class="regular">8</span> = regular hours, <span class="overtime">More than 8</span> = overtime hours, <span style="color:#dc2626;font-weight:700;">A</span> = absent, <span style="font-weight:700;">F</span> = Friday (weekend)
        </div>
    </div>
    <div class="summary-section">
        <div class="summary-box">
            <div class="label">Total Hours:</div>
            <div class="value">{{ $total_hours }}</div>
            <div class="label">Absent Hours:</div>
            <div class="value value-red">{{ $absent_days * 8 }}</div>
            <div class="label">Absent Days:</div>
            <div class="value value-red">{{ $absent_days }}</div>
            <div class="label">Overtime Hours:</div>
            <div class="value value-green">{{ $total_overtime_hours }}</div>
        </div>
        <div class="summary-box">
            <div class="label">Basic Salary:</div>
            <div class="value value-green">SAR {{ number_format($salary_details['basic_salary'], 2) }}</div>
            <div class="label">Allowances:</div>
            <div class="value">SAR {{ number_format($salary_details['total_allowances'], 2) }}</div>
            <div class="label">Absent Deduction:</div>
            <div class="value value-red">SAR {{ number_format($salary_details['absent_deduction'], 2) }}</div>
            <div class="label">Overtime Pay:</div>
            <div class="value value-green">SAR {{ number_format($salary_details['overtime_pay'], 2) }}</div>
            <div class="label">Advance:</div>
            <div class="value value-red">SAR {{ number_format($employee->advance_payment ?? 0, 2) }}</div>
            <div class="label">Total Deductions:</div>
            <div class="value value-red">SAR {{ number_format(($salary_details['absent_deduction'] + ($employee->advance_payment ?? 0)), 2) }}</div>
            <div class="label">Net Salary:</div>
            <div class="value value-green">SAR {{ number_format($salary_details['net_salary'], 2) }}</div>
        </div>
    </div>
    <div class="signatures">
        <div class="signature-block">
            <div class="signature-label">Chief-Accountant</div>
            <div class="signature-line">samir_taima</div>
            <div class="signature-line">Signature</div>
        </div>
        <div class="signature-block">
            <div class="signature-label">verified_by</div>
            <div class="signature-line">salem_samhan_al_dosri</div>
            <div class="signature-line">Signature</div>
        </div>
        <div class="signature-block">
            <div class="signature-label">approved_by</div>
            <div class="signature-line">nasser_samhan_al_dosri</div>
            <div class="signature-line">Signature</div>
        </div>
    </div>
</div>
</body>
</html>
