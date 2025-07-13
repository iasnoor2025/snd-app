<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Final Settlement Document</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .company-logo {
            max-width: 200px;
            margin-bottom: 20px;
        }
        .document-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #2c3e50;
            text-transform: uppercase;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .label {
            font-weight: bold;
            color: #7f8c8d;
        }
        .value {
            color: #2c3e50;
        }
        .settlement-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .settlement-table th,
        .settlement-table td {
            padding: 10px;
            border: 1px solid #bdc3c7;
            text-align: left;
        }
        .settlement-table th {
            background-color: #f5f6fa;
            color: #2c3e50;
        }
        .total-row {
            font-weight: bold;
            background-color: #f8f9fa;
        }
        .signature-section {
            margin-top: 50px;
        }
        .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
        }
        .signature-box {
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
        }
        @page {
            margin: 100px 25px;
        }
    </style>
</head>
<body>
    <div class="header">
        @if($company['logo'])
            <img src="{{ $company['logo'] }}" alt="Company Logo" class="company-logo">
        @endif
        <div class="document-title">Final Settlement Statement</div>
    </div>

    <div class="section">
        <div class="section-title">Employee Information</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="label">Employee Name:</span>
                <span class="value">{{ $employee['name'] }}</span>
            </div>
            <div class="info-item">
                <span class="label">Employee ID:</span>
                <span class="value">{{ $employee['id'] }}</span>
            </div>
            <div class="info-item">
                <span class="label">Department:</span>
                <span class="value">{{ $employee['department'] }}</span>
            </div>
            <div class="info-item">
                <span class="label">Designation:</span>
                <span class="value">{{ $employee['position'] }}</span>
            </div>
            <div class="info-item">
                <span class="label">Join Date:</span>
                <span class="value">{{ $employee['join_date'] }}</span>
            </div>
            <div class="info-item">
                <span class="label">Last Working Date:</span>
                <span class="value">{{ $employee['end_date'] }}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Settlement Details</div>
        <table class="settlement-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Basic Salary</td>
                    <td>{{ number_format($settlement['basic_salary'], 2) }}</td>
                </tr>
                @foreach($settlement['allowances'] as $allowance)
                    <tr>
                        <td>{{ $allowance['name'] }}</td>
                        <td>{{ number_format($allowance['amount'], 2) }}</td>
                    </tr>
                @endforeach
                <tr>
                    <td>Gratuity</td>
                    <td>{{ number_format($settlement['gratuity'], 2) }}</td>
                </tr>
                <tr>
                    <td>Leave Balance Encashment</td>
                    <td>{{ number_format($settlement['leave_balance'], 2) }}</td>
                </tr>
                <tr>
                    <td>Notice Period Adjustment</td>
                    <td>{{ number_format($settlement['notice_period'], 2) }}</td>
                </tr>
                @foreach($settlement['deductions'] as $deduction)
                    <tr>
                        <td>{{ $deduction['name'] }} (Deduction)</td>
                        <td>-{{ number_format($deduction['amount'], 2) }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td>Final Settlement Amount</td>
                    <td>{{ number_format($settlement['final_settlement'], 2) }}</td>
                </tr>
            </tbody>
        </table>

        @if($settlement['remarks'])
            <div class="info-item">
                <span class="label">Remarks:</span>
                <span class="value">{{ $settlement['remarks'] }}</span>
            </div>
        @endif
    </div>

    <div class="signature-section">
        <div class="section-title">Authorizations</div>
        <div class="signature-grid">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Employee Signature</div>
                <div>{{ $employee['name'] }}</div>
                <div>Date: _______________</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>HR Manager</div>
                <div>{{ $generated_by['name'] }}</div>
                <div>Date: {{ $generated_by['date'] }}</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Finance Manager</div>
                <div>Name: _______________</div>
                <div>Date: _______________</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>{{ $company['name'] }} | {{ $company['address'] }}</p>
        <p>Phone: {{ $company['phone'] }} | Email: {{ $company['email'] }}</p>
        <p>Generated on: {{ $generated_by['date'] }}</p>
    </div>
</body>
</html>
