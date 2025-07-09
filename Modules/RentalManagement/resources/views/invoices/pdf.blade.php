<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>Invoice #{{ $invoice->invoice_number }}</h1>
    <p><strong>Date:</strong> {{ $invoice->issue_date ? ($invoice->issue_date instanceof \Carbon\Carbon ? $invoice->issue_date->format('Y-m-d') : $invoice->issue_date) : '' }}</p>
    <p><strong>Customer:</strong> {{ isset($invoice->customer) ? ($invoice->customer->company_name ?? '') : '' }}</p>
    <p><strong>Status:</strong> {{ ucfirst($invoice->status ?? '') }}</p>
    <hr>
    <h3>Items</h3>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
        @if(isset($invoice->items) && count($invoice->items))
            @foreach($invoice->items as $item)
                <tr>
                    <td>{{ $item->description ?? '' }}</td>
                    <td>{{ $item->quantity ?? '' }}</td>
                    <td>{{ isset($item->unit_price) ? number_format($item->unit_price, 2) : '' }}</td>
                    <td>{{ isset($item->amount) ? number_format($item->amount, 2) : '' }}</td>
                </tr>
            @endforeach
        @else
            <tr><td colspan="4">No items</td></tr>
        @endif
        </tbody>
    </table>
    <hr>
    <p><strong>Subtotal:</strong> {{ isset($invoice->subtotal) ? number_format($invoice->subtotal, 2) : '0.00' }}</p>
    <p><strong>Discount:</strong> {{ isset($invoice->discount_amount) ? number_format($invoice->discount_amount, 2) : '0.00' }}</p>
    <p><strong>Tax:</strong> {{ isset($invoice->tax_amount) ? number_format($invoice->tax_amount, 2) : '0.00' }}</p>
    <p><strong>Total:</strong> {{ isset($invoice->total_amount) ? number_format($invoice->total_amount, 2) : '0.00' }}</p>
</body>
</html>
