@component('mail::message')
# Rental Quotation

Dear {{ $quotation->customer->company_name ?? 'Customer' }},

Thank you for your interest. Please find your quotation details below:

**Quotation Number:** {{ $quotation->quotation_number }}
**Issue Date:** {{ $quotation->issue_date->format('Y-m-d') }}
**Valid Until:** {{ $quotation->valid_until->format('Y-m-d') }}

## Quotation Items
@component('mail::table')
| Equipment | Description | Quantity | Rate | Total |
|-----------|-------------|----------|------|-------|
@foreach ($quotation->quotationItems as $item)
| {{ $item->equipment->name ?? '-' }} | {{ $item->description ?? '-' }} | {{ $item->quantity }} | {{ number_format($item->rate, 2) }} | {{ number_format($item->total_amount, 2) }} |
@endforeach
@endcomponent

**Subtotal:** {{ number_format($quotation->subtotal, 2) }}
**Discount:** {{ number_format($quotation->discount_amount, 2) }}
**Tax:** {{ number_format($quotation->tax_amount, 2) }}
**Total:** {{ number_format($quotation->total_amount, 2) }}

@if($quotation->notes)
---
**Notes:**
{{ $quotation->notes }}
@endif

Thanks,
{{ config('app.name') }}
@endcomponent
