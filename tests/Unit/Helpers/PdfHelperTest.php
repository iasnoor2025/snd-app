<?php

namespace Tests\Unit\Helpers;

use Tests\TestCase;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PdfHelperTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    /** @test */
    public function it_can_generate_unique_pdf_filename()
    {
        $filename1 = generate_pdf_filename('test');
        $filename2 = generate_pdf_filename('test');

        $this->assertStringEndsWith('.pdf', $filename1);
        $this->assertStringStartsWith('test_', $filename1);
        $this->assertNotEquals($filename1, $filename2);
    }

    /** @test */
    public function it_can_sanitize_filename()
    {
        $dirty = 'Test File (1) @#$.pdf';
        $clean = sanitize_filename($dirty);

        $this->assertEquals('test_file_1.pdf', $clean);
    }

    /** @test */
    public function it_can_get_pdf_storage_path()
    {
        $path = get_pdf_storage_path('reports', 'test.pdf');
        $this->assertEquals('reports/test.pdf', $path);

        $path = get_pdf_storage_path('reports/monthly', 'test.pdf');
        $this->assertEquals('reports/monthly/test.pdf', $path);
    }

    /** @test */
    public function it_can_get_pdf_temp_path()
    {
        $path = get_pdf_temp_path('test.pdf');
        $this->assertStringStartsWith('temp/', $path);
        $this->assertStringEndsWith('test.pdf', $path);
    }

    /** @test */
    public function it_can_validate_pdf_file()
    {
        // Create a fake PDF file
        Storage::put('test.pdf', '%PDF-1.4');
        $this->assertTrue(is_valid_pdf('test.pdf'));

        // Create an invalid file
        Storage::put('fake.pdf', 'Not a PDF');
        $this->assertFalse(is_valid_pdf('fake.pdf'));
    }

    /** @test */
    public function it_can_get_pdf_metadata()
    {
        $metadata = get_pdf_metadata([
            'title' => 'Test Document',
            'author' => 'John Doe',
            'subject' => 'Testing'
        ]);

        $this->assertArrayHasKey('Title', $metadata);
        $this->assertEquals('Test Document', $metadata['Title']);
        $this->assertEquals('John Doe', $metadata['Author']);
    }

    /** @test */
    public function it_can_format_page_numbers()
    {
        $this->assertEquals('Page 1 of 5', format_page_numbers(1, 5));
        $this->assertEquals('1/5', format_page_numbers(1, 5, 'compact'));
        $this->assertEquals('Page 1', format_page_numbers(1, null, 'simple'));
    }

    /** @test */
    public function it_can_generate_watermark_text()
    {
        $text = generate_watermark_text('CONFIDENTIAL', [
            'opacity' => 0.5,
            'angle' => 45
        ]);

        $this->assertStringContainsString('CONFIDENTIAL', $text);
        $this->assertStringContainsString('opacity: 0.5', $text);
        $this->assertStringContainsString('transform: rotate(45deg)', $text);
    }

    /** @test */
    public function it_can_calculate_pdf_dimensions()
    {
        $dimensions = calculate_pdf_dimensions('a4', 'portrait');
        $this->assertEquals(210, $dimensions['width']);
        $this->assertEquals(297, $dimensions['height']);

        $dimensions = calculate_pdf_dimensions('a4', 'landscape');
        $this->assertEquals(297, $dimensions['width']);
        $this->assertEquals(210, $dimensions['height']);
    }

    /** @test */
    public function it_can_merge_pdf_options()
    {
        $default = [
            'paper' => 'a4',
            'orientation' => 'portrait',
            'margin' => 20
        ];

        $custom = [
            'orientation' => 'landscape',
            'watermark' => 'DRAFT'
        ];

        $merged = merge_pdf_options($default, $custom);

        $this->assertEquals('a4', $merged['paper']);
        $this->assertEquals('landscape', $merged['orientation']);
        $this->assertEquals(20, $merged['margin']);
        $this->assertEquals('DRAFT', $merged['watermark']);
    }

    /** @test */
    public function it_can_format_file_size()
    {
        $this->assertEquals('1.00 KB', format_file_size(1024));
        $this->assertEquals('1.00 MB', format_file_size(1024 * 1024));
        $this->assertEquals('1.00 GB', format_file_size(1024 * 1024 * 1024));
    }

    /** @test */
    public function it_can_generate_pdf_header()
    {
        $header = generate_pdf_header([
            'title' => 'Monthly Report',
            'date' => '2024-03-21',
            'logo' => 'path/to/logo.png'
        ]);

        $this->assertStringContainsString('Monthly Report', $header);
        $this->assertStringContainsString('2024-03-21', $header);
        $this->assertStringContainsString('logo.png', $header);
    }

    /** @test */
    public function it_can_generate_pdf_footer()
    {
        $footer = generate_pdf_footer([
            'company' => 'Test Company',
            'page_number' => true,
            'timestamp' => true
        ]);

        $this->assertStringContainsString('Test Company', $footer);
        $this->assertStringContainsString('Page', $footer);
        $this->assertStringContainsString('Generated on', $footer);
    }

    /** @test */
    public function it_can_validate_pdf_options()
    {
        $valid = [
            'paper' => 'a4',
            'orientation' => 'portrait',
            'margin' => 20
        ];
        $this->assertTrue(validate_pdf_options($valid));

        $invalid = [
            'paper' => 'invalid',
            'orientation' => 'wrong'
        ];
        $this->assertFalse(validate_pdf_options($invalid));
    }

    /** @test */
    public function it_can_get_supported_paper_sizes()
    {
        $sizes = get_supported_paper_sizes();
        
        $this->assertIsArray($sizes);
        $this->assertContains('a4', $sizes);
        $this->assertContains('letter', $sizes);
        $this->assertContains('legal', $sizes);
    }

    /** @test */
    public function it_can_convert_html_to_pdf_safe()
    {
        $html = '<script>alert("unsafe")</script><p>Safe content</p>';
        $safe = convert_html_to_pdf_safe($html);

        $this->assertStringNotContainsString('<script>', $safe);
        $this->assertStringContainsString('<p>Safe content</p>', $safe);
    }
} 