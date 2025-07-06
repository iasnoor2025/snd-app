<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportService
{
    /**
     * Export data to CSV format
     */
    public function exportToCsv(Collection $data, string $filename = 'export.csv'): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return new StreamedResponse(function () use ($data) {
            $handle = fopen('php://output', 'w');

            // Write CSV header
            if ($data->isNotEmpty()) {
                $firstRow = $data->first();
                if (is_array($firstRow) || is_object($firstRow)) {
                    $headers = array_keys((array) $firstRow);
                    fputcsv($handle, $headers);
                }
            }

            // Write data rows
            foreach ($data as $row) {
                fputcsv($handle, (array) $row);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export data to Excel format (requires maatwebsite/excel package)
     */
    public function exportToExcel(Collection $data, string $filename = 'export.xlsx'): Response
    {
        // For now, we'll export as CSV since Excel package might not be installed
        // In production, you would use: return Excel::download(new DataExport($data), $filename);

        return $this->exportToCsv($data, str_replace('.xlsx', '.csv', $filename));
    }

    /**
     * Export data to PDF format
     */
    public function exportToPdf(Collection $data, string $filename = 'export.pdf'): Response
    {
        // This is a placeholder implementation
        // In production, you would use a PDF library like TCPDF, FPDF, or DomPDF

        $html = $this->generateHtmlTable($data);

        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * Export data to JSON format
     */
    public function exportToJson(Collection $data, string $filename = 'export.json'): Response
    {
        $json = $data->toJson(JSON_PRETTY_PRINT);

        return response($json)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * Export data to XML format
     */
    public function exportToXml(Collection $data, string $filename = 'export.xml'): Response
    {
        $xml = new \SimpleXMLElement('<data/>');

        foreach ($data as $index => $item) {
            $row = $xml->addChild('row');
            foreach ((array) $item as $key => $value) {
                $row->addChild($key, htmlspecialchars((string) $value));
            }
        }

        return response($xml->asXML())
            ->header('Content-Type', 'application/xml')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * Generate HTML table from data
     */
    protected function generateHtmlTable(Collection $data): string
    {
        if ($data->isEmpty()) {
            return '<p>No data to export</p>';
        }

        $html = '<table border="1" cellpadding="5" cellspacing="0">';

        // Table header
        $firstRow = $data->first();
        if (is_array($firstRow) || is_object($firstRow)) {
            $headers = array_keys((array) $firstRow);
            $html .= '<thead><tr>';
            foreach ($headers as $header) {
                $html .= '<th>' . htmlspecialchars($header) . '</th>';
            }
            $html .= '</tr></thead>';
        }

        // Table body
        $html .= '<tbody>';
        foreach ($data as $row) {
            $html .= '<tr>';
            foreach ((array) $row as $value) {
                $html .= '<td>' . htmlspecialchars((string) $value) . '</td>';
            }
            $html .= '</tr>';
        }
        $html .= '</tbody></table>';

        return $html;
    }

    /**
     * Get supported export formats
     */
    public function getSupportedFormats(): array
    {
        return [
            'csv' => 'Comma Separated Values',
            'excel' => 'Microsoft Excel',
            'pdf' => 'Portable Document Format',
            'json' => 'JavaScript Object Notation',
            'xml' => 'Extensible Markup Language',
        ];
    }

    /**
     * Validate export format
     */
    public function isValidFormat(string $format): bool
    {
        return array_key_exists($format, $this->getSupportedFormats());
    }

    /**
     * Export data based on format
     */
    public function export(Collection $data, string $format, string $filename = null): Response
    {
        if (!$this->isValidFormat($format)) {
            throw new \InvalidArgumentException("Unsupported export format: {$format}");
        }

        $filename = $filename ?? 'export.' . $format;

        switch ($format) {
            case 'csv':
                return $this->exportToCsv($data, $filename);
            case 'excel':
                return $this->exportToExcel($data, $filename);
            case 'pdf':
                return $this->exportToPdf($data, $filename);
            case 'json':
                return $this->exportToJson($data, $filename);
            case 'xml':
                return $this->exportToXml($data, $filename);
            default:
                throw new \InvalidArgumentException("Unsupported export format: {$format}");
        }
    }

    /**
     * Get supported export formats for report builder
     */
    public function getFormats(): array
    {
        return ['csv', 'xlsx', 'pdf', 'json'];
    }
}
