<?php

namespace Tests\Unit\Helpers;

use Tests\TestCase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class DocumentHelperTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('documents');
    }

    /** @test */
    public function it_can_generate_document_path()
    {
        $path = generate_document_path('employee', 'contracts', 'test.pdf');
        $this->assertEquals('employee/contracts/test.pdf', $path);

        $path = generate_document_path('project', 'specs', 'test.pdf', '2024/03');
        $this->assertEquals('project/specs/2024/03/test.pdf', $path);
    }

    /** @test */
    public function it_can_validate_document_type()
    {
        $this->assertTrue(is_valid_document_type('pdf'));
        $this->assertTrue(is_valid_document_type('docx'));
        $this->assertFalse(is_valid_document_type('exe'));
    }

    /** @test */
    public function it_can_get_document_mime_type()
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $mime = get_document_mime_type($file);
        $this->assertEquals('application/pdf', $mime);
    }

    /** @test */
    public function it_can_sanitize_document_name()
    {
        $dirty = 'Test Document (1) @#$.pdf';
        $clean = sanitize_document_name($dirty);

        $this->assertEquals('test_document_1.pdf', $clean);
        $this->assertFalse(str_contains($clean, ' '));
    }

    /** @test */
    public function it_can_generate_document_version()
    {
        $version = generate_document_version('test.pdf', ['test_v1.pdf', 'test_v2.pdf']);
        $this->assertEquals('test_v3.pdf', $version);
    }

    /** @test */
    public function it_can_extract_document_metadata()
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $metadata = extract_document_metadata($file);

        $this->assertArrayHasKey('size', $metadata);
        $this->assertArrayHasKey('mime_type', $metadata);
        $this->assertArrayHasKey('extension', $metadata);
    }

    /** @test */
    public function it_can_generate_document_preview()
    {
        $preview = generate_document_preview('test.pdf', [
            'width' => 200,
            'height' => 300,
            'format' => 'jpg'
        ]);

        $this->assertStringEndsWith('.jpg', $preview);
        $this->assertStringStartsWith('preview_', $preview);
    }

    /** @test */
    public function it_can_validate_document_size()
    {
        $file = UploadedFile::fake()->create('small.pdf', 100);
        $this->assertTrue(is_valid_document_size($file, 1024)); // 1MB limit

        $file = UploadedFile::fake()->create('large.pdf', 2048);
        $this->assertFalse(is_valid_document_size($file, 1024));
    }

    /** @test */
    public function it_can_generate_document_hash()
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $hash1 = generate_document_hash($file);
        $hash2 = generate_document_hash($file);

        $this->assertEquals($hash1, $hash2);
        $this->assertEquals(64, strlen($hash1)); // SHA-256 length
    }

    /** @test */
    public function it_can_get_document_extension()
    {
        $this->assertEquals('pdf', get_document_extension('test.pdf'));
        $this->assertEquals('docx', get_document_extension('test.docx'));
        $this->assertEquals('', get_document_extension('test'));
    }

    /** @test */
    public function it_can_format_document_size()
    {
        $this->assertEquals('1.00 KB', format_document_size(1024));
        $this->assertEquals('1.00 MB', format_document_size(1024 * 1024));
        $this->assertEquals('1.00 GB', format_document_size(1024 * 1024 * 1024));
    }

    /** @test */
    public function it_can_generate_document_thumbnail()
    {
        $thumbnail = generate_document_thumbnail('test.pdf', [
            'width' => 100,
            'height' => 100
        ]);

        $this->assertStringEndsWith('.png', $thumbnail);
        $this->assertStringStartsWith('thumb_', $thumbnail);
    }

    /** @test */
    public function it_can_validate_document_permissions()
    {
        $permissions = [
            'view' => true,
            'edit' => false,
            'delete' => false
        ];

        $this->assertTrue(validate_document_permissions($permissions, 'view'));
        $this->assertFalse(validate_document_permissions($permissions, 'edit'));
    }

    /** @test */
    public function it_can_generate_document_url()
    {
        $url = generate_document_url('employee/contracts/test.pdf', [
            'expires' => 3600,
            'signature' => true
        ]);

        $this->assertStringContainsString('signature=', $url);
        $this->assertStringContainsString('expires=', $url);
    }

    /** @test */
    public function it_can_get_document_type_icon()
    {
        $this->assertEquals('pdf.svg', get_document_type_icon('test.pdf'));
        $this->assertEquals('word.svg', get_document_type_icon('test.docx'));
        $this->assertEquals('default.svg', get_document_type_icon('test.unknown'));
    }

    /** @test */
    public function it_can_validate_document_signature()
    {
        $signature = 'valid_signature_hash';
        $url = "https://example.com/document?signature=$signature";

        $this->assertTrue(validate_document_signature($url, $signature));
        $this->assertFalse(validate_document_signature($url, 'invalid_signature'));
    }

    /** @test */
    public function it_can_generate_document_audit_log()
    {
        $log = generate_document_audit_log('test.pdf', 'view', [
            'user_id' => 1,
            'ip_address' => '127.0.0.1'
        ]);

        $this->assertArrayHasKey('action', $log);
        $this->assertArrayHasKey('timestamp', $log);
        $this->assertArrayHasKey('user_id', $log);
        $this->assertArrayHasKey('ip_address', $log);
    }
} 