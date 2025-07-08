<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Quotation</title>
<style>
  body {
    font-family: Arial, "Noto Sans", "DejaVu Sans", sans-serif;
    font-size: 13px;
    margin: 0;
    padding: 0;
    background: #fff;
    color: #222;
  }
  .container {
    max-width: 700px;
    margin: 24px auto;
    padding: 24px;
    border: 1px solid #ddd;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .logo-box {
    background: #000;
    color: #fff;
    font-weight: bold;
    font-size: 28px;
    width: 56px;
    height: 56px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    margin-right: 12px;
  }
  .logo {
    display: flex;
    align-items: center;
  }
  .logo-text {
    font-weight: bold;
    font-size: 16px;
    letter-spacing: 1px;
  }
  h1 {
    color: #0051ffb2;
    font-weight: bold;
    font-size: 28px;
    margin: 0;
  }
  .quotation-meta {
    text-align: right;
    font-size: 12px;
  }
  .quotation-meta strong {
    font-weight: 600;
  }
  /* Info boxes side by side */
  .info-section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 32px 0 12px;
    gap: 20px;
    flex-wrap: nowrap; /* Force one row, no wrapping */
  }
  .info-box {
    background: #fff3d6;
    padding: 16px 20px;
    border-radius: 8px;
    flex: 1 1 0;
    font-size: 13px;
  }
  .info-title {
    color: #1235d1;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 6px;
  }
  .info-box p {
    margin: 4px 0;
    line-height: 1.3;
  }
  .info-label {
    font-weight: 600;
  }
  .supply-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 12px;
  }
  .supply-label {
    font-weight: bold;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  th, td {
    border: 1px solid #ff8000;
    padding: 8px 6px;
    text-align: left;
  }
  th {
    background: #ff8000;
    color: white;
    font-weight: bold;
  }
  tbody tr:nth-child(even) {
    background: #fff3d1;
  }
  .totals-section {
    margin-top: 18px;
    display: flex;
    justify-content: flex-end;
  }
  .totals-table {
    width: 320px;
    font-size: 14px;
  }
  .totals-table td {
    border: none;
    padding: 4px 0;
  }
  .totals-table .label {
    font-weight: normal;
    color: #222;
  }
  .totals-table .discount {
    color: #388e3c;
    font-weight: bold;
    background: #fff8dc;
  }
  .totals-table .total {
    font-weight: bold;
    font-size: 18px;
    border-top: 2px solid #ff8000;
    padding-top: 8px;
  }
  .totals-table .total-words {
    font-size: 12px;
    color: #555;
    padding-top: 6px;
    font-style: italic;
    background: #fff8dc;
  }
  .terms-notes {
    margin-top: 32px;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }
  .terms, .notes {
    flex: 1;
    font-size: 12px;
    min-width: 280px;
  }
  .terms strong, .notes strong {
    color: #210dd4;
  }
  ol {
    padding-left: 20px;
    margin-top: 6px;
  }
  .footer {
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    flex-wrap: wrap;
  }
  .signature {
    text-align: right;
    font-size: 12px;
    color: #555;
  }
  /* Responsive */
  @media (max-width: 600px) {
    .info-section, .terms-notes, .footer {
      flex-direction: column;
    }
    .totals-section {
      justify-content: center;
    }
    .signature {
      text-align: left;
      margin-top: 16px;
    }
  }
</style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <div class="logo-box">SND</div>
        <div class="logo-text">Samhan Nasir Al-Dosari</div>
      </div>
      <h1>Quotation</h1>
      <div class="quotation-meta">
        <div>Quotation# <strong>Qout-{{ $quotation->id }}</strong></div>
        <div>Quotation Date <strong>{{ $quotation->created_at ? $quotation->created_at->format('M d, Y') : '-' }}</strong></div>
      </div>
    </header>

    <section class="info-section">
      <div class="info-box">
        <div class="info-title">Quotation to</div>
        <div>{{ $quotation->customer->company_name ?? $quotation->customer->name ?? '-' }}</div>
        <div>{!! nl2br(e($quotation->customer->address ?? '-')) !!}</div>
        <div style="margin-top:8px;"><span class="info-label">GSTIN</span> {{ $quotation->customer->gstin ?? '-' }}</div>
        <div><span class="info-label">PAN</span> {{ $quotation->customer->pan ?? '-' }}</div>
      </div>
    </section>

    <div class="supply-row">
      <div><span class="supply-label">Place of Supply</span> <strong>{{ $quotation->place_of_supply ?? '-' }}</strong></div>
      <div><span class="supply-label">Country of Supply</span> <strong>{{ $quotation->country_of_supply ?? '-' }}</strong></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item #/Item description</th>
          <th>Qty.</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        @foreach($quotation->quotationItems as $i => $item)
          <tr>
            <td>{{ $i + 1 }}. {{ $item->name ?? '-' }}</td>
            <td>{{ $item->quantity ?? '-' }}</td>
            <td>&#8377; {{ number_format($item->rate ?? 0, 2) }}</td>
            <td>&#8377; {{ number_format($item->total_amount ?? 0, 2) }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>

    <div class="totals-section" style="width:100%; display:flex; justify-content:flex-end;">
      <table class="totals-table" style="margin-left:auto;">
        <tr>
          <td class="label">Sub Total</td>
          <td class="value" style="text-align:right;">&#8377;{{ number_format($quotation->subtotal ?? 0, 2) }}</td>
        </tr>
        <tr>
          <td class="label discount">Discount({{ isset($quotation->discount_percentage) ? ($quotation->discount_percentage * 100) : 0 }}%)</td>
          <td class="value discount" style="text-align:right;">- &#8377;{{ number_format($quotation->discount_amount ?? 0, 2) }}</td>
        </tr>
        <tr>
          <td class="total">Total</td>
          <td class="total" style="text-align:right;">&#8377;{{ number_format($quotation->total_amount ?? 0, 2) }}</td>
        </tr>
        <tr>
          <td colspan="2" class="total-words" style="text-align:right;">Invoice Total (in words)<br />
            <strong>
              {{ function_exists('numberToWords') ? numberToWords($quotation->total_amount ?? 0) : '-' }}
            </strong>
          </td>
        </tr>
      </table>
    </div>

    <div class="terms-notes">
      <div class="terms">
        <strong>Terms and Conditions</strong>
        <ol>
          <li>Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.</li>
          <li>Please quote invoice number when remitting funds.</li>
        </ol>
      </div>
      {{-- <div class="notes">
        <strong>Additional Notes</strong>
        <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here.'</p>
      </div> --}}
    </div>

    <footer class="footer">
      <div class="signature">
        <svg width="120" height="48">
          <text x="10" y="35" font-size="32" fill="#003366">&#x270E;</text>
        </svg>
        <div>Authorized Signature</div>
      </div>
    </footer>
  </div>
</body>
</html>
