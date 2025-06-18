# Reports Dashboard & Custom Report Builder

## Overview
The Reports dashboard provides a comprehensive overview of key business metrics, recent activity, and revenue trends. It supports advanced filtering, export (CSV/PDF), and a custom report builder for generating tailored reports.

## Features
- Dashboard stats for clients, equipment, rentals, invoices, and payments
- Interactive revenue chart
- Recent activity tables with sorting and pagination
- Export dashboard and custom reports as CSV or PDF
- Custom report builder modal for advanced reporting
- Accessibility and responsive design

## Usage
- Use the filters at the top to narrow down dashboard data.
- Click column headers in tables to sort; use pagination controls to navigate.
- Click "Export CSV" or "Export PDF" to download the dashboard report.
- Click "Create Custom Report" to open the report builder modal:
  - Select report type, date range, columns, and output format
  - Click "Export CSV" or "Export PDF" to download the custom report

## API Endpoints
- `POST /reports/export-dashboard` — Export dashboard report (CSV/PDF)
  - Body: `{ dateFrom, dateTo, search, format }`
- `POST /reports/builder/export` — Export custom report (CSV/PDF)
  - Body: `{ data: { reportType, dateFrom, dateTo, columns }, format, filename }`

## Accessibility
- All controls are keyboard accessible and have ARIA labels
- Error and loading states are clearly indicated
- RTL and multi-language support is built-in

## Testing
- See `Index.test.tsx` for unit tests covering dashboard rendering and modal behavior 
