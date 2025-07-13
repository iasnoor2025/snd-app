<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payslip - {{ $period }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333;
        }
        .company-logo {
            max-width: 200px;
            margin-bottom: 10px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .company-address {
            font-size: 12px;
            color: #666;
        }
        .payslip-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .employee-info {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .info-label {
            font-weight: bold;
            width: 150px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ccc;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .amount {
            text-align: right;
        }
        .total-row {
            font-weight: bold;
            background-color: #f5f5f5;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            font-size: 10px;
            color: #666;
            text-align: center;
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        @if($company['logo'])
            <img src="{{ $company['logo'] }}" alt="Company Logo" class="company-logo">
        @endif
        <div class="company-name">{{ $company['name'] }}</div>
        <div class="company-address">{{ $company['address'] }}</div>
    </div>

    <div class="payslip-title">
        PAYSLIP FOR {{ strtoupper(Carbon\Carbon::createFromFormat('Y-m', $period)->format('F Y')) }}
    </div>

    <div class="employee-info">
        <div class="info-row">
            <span class="info-label">Employee Name:</span>
            <span>{{ $employee['first_name'] }} {{ $employee['last_name'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Employee ID:</span>
            <span>{{ $employee['employee_id'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Department:</span>
            <span>{{ $employee['department'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Designation:</span>
            <span>{{ $employee['position'] }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Pay Period:</span>
            <span>{{ Carbon\Carbon::createFromFormat('Y-m', $period)->format('F Y') }}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Earnings</div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="amount">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Basic Salary</td>
                    <td class="amount">{{ number_format($data['basic_salary'], 2) }}</td>
                </tr>
                @foreach($data['allowances'] ?? [] as $allowance)
                    <tr>
                        <td>{{ $allowance['name'] }}</td>
                        <td class="amount">{{ number_format($allowance['amount'], 2) }}</td>
                    </tr>
                @endforeach
                @foreach($data['overtime'] ?? [] as $overtime)
                    <tr>
                        <td>{{ $overtime['description'] }}</td>
                        <td class="amount">{{ number_format($overtime['amount'], 2) }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td>Total Earnings</td>
                    <td class="amount">{{ number_format($totals['gross_pay'], 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Deductions</div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="amount">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['deductions'] ?? [] as $deduction)
                    <tr>
                        <td>{{ $deduction['name'] }}</td>
                        <td class="amount">{{ number_format($deduction['amount'], 2) }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td>Total Deductions</td>
                    <td class="amount">{{ number_format($totals['total_deductions'], 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Net Pay</div>
        <table>
            <tbody>
                <tr class="total-row">
                    <td>Net Pay</td>
                    <td class="amount">{{ number_format($totals['net_pay'], 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line">Employee Signature</div>
        </div>
        <div class="signature-box">
            <div class="signature-line">Authorized Signature</div>
        </div>
    </div>

    <div class="footer">
        <p>Generated on {{ $generated_at }} | This is a computer-generated document and does not require a signature.</p>
        <p>For any queries regarding this payslip, please contact the HR department.</p>
    </div>
</body>
</html>
