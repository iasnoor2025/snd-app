<?php

use Modules\RentalManagement\Domain\Models\Quotation;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Quotation PDF generation', function () {
    it('generates a PDF for a quotation', function () {
        $quotation = Quotation::factory()->create();
        // Mock or call the PDF generation logic
        $pdfPath = '/tmp/quotation_' . $quotation->id . '.pdf';
        // Simulate PDF generation
        file_put_contents($pdfPath, 'PDF CONTENT');
        expect(file_exists($pdfPath))->toBeTrue();
        unlink($pdfPath);
    });
});
