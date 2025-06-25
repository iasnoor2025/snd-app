<?php

namespace Tests\Unit\Helpers;

use Tests\TestCase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class FileUploadHelperTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('uploads');
    }

    /** @test */
    public function it_can_handle_single_file_upload()
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);
        
        $result = handle_file_upload($file, 'documents');
        
        $this->assertTrue(Storage::disk('uploads')->exists($result['path']));
        $this->assertEquals('test.pdf', $result['original_name']);
        $this->assertEquals('application/pdf', $result['mime_type']);
    }

    /** @test */
    public function it_can_handle_multiple_file_upload()
    {
        $files = [
            UploadedFile::fake()->create('test1.pdf', 100),
            UploadedFile::fake()->create('test2.pdf', 100)
        ];
        
        $results = handle_multiple_file_upload($files, 'documents');
        
        $this->assertCount(2, $results);
        foreach ($results as $result) {
            $this->assertTrue(Storage::disk('uploads')->exists($result['path']));
        }
    }

    /** @test */
    public function it_can_validate_file_type()
    {
        $validFile = UploadedFile::fake()->create('test.pdf', 100);
        $invalidFile = UploadedFile::fake()->create('test.exe', 100);
        
        $this->assertTrue(validate_file_type($validFile, ['pdf', 'docx']));
        $this->assertFalse(validate_file_type($invalidFile, ['pdf', 'docx']));
    }

    /** @test */
    public function it_can_validate_file_size()
    {
        $smallFile = UploadedFile::fake()->create('small.pdf', 100);
        $largeFile = UploadedFile::fake()->create('large.pdf', 2048);
        
        $this->assertTrue(validate_file_size($smallFile, 1024)); // 1MB limit
        $this->assertFalse(validate_file_size($largeFile, 1024));
    }

    /** @test */
    public function it_can_generate_unique_filename()
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);
        
        $filename1 = generate_unique_filename($file);
        $filename2 = generate_unique_filename($file);
        
        $this->assertNotEquals($filename1, $filename2);
        $this->assertStringEndsWith('.pdf', $filename1);
    }

    /** @test */
    public function it_can_create_upload_directory()
    {
        $path = create_upload_directory('documents/2024/03');
        
        $this->assertTrue(Storage::disk('uploads')->exists($path));
    }

    /** @test */
    public function it_can_get_file_metadata()
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);
        
        $metadata = get_file_metadata($file);
        
        $this->assertArrayHasKey('size', $metadata);
        $this->assertArrayHasKey('mime_type', $metadata);
        $this->assertArrayHasKey('extension', $metadata);
    }

    /** @test */
    public function it_can_sanitize_filename()
    {
        $dirty = 'Test File (1) @#$.pdf';
        $clean = sanitize_filename($dirty);
        
        $this->assertEquals('test_file_1.pdf', $clean);
        $this->assertFalse(str_contains($clean, ' '));
    }

    /** @test */
    public function it_can_generate_file_path()
    {
        $path = generate_file_path('documents', 'test.pdf', '2024/03');
        
        $this->assertEquals('documents/2024/03/test.pdf', $path);
    }

    /** @test */
    public function it_can_handle_image_upload()
    {
        $image = UploadedFile::fake()->image('test.jpg', 400, 300);
        
        $result = handle_image_upload($image, 'images', [
            'max_width' => 800,
            'max_height' => 600
        ]);
        
        $this->assertTrue(Storage::disk('uploads')->exists($result['path']));
        $this->assertArrayHasKey('dimensions', $result);
    }

    /** @test */
    public function it_can_generate_thumbnails()
    {
        $image = UploadedFile::fake()->image('test.jpg', 400, 300);
        
        $thumbnails = generate_thumbnails($image, [
            'small' => ['width' => 100, 'height' => 100],
            'medium' => ['width' => 300, 'height' => 300]
        ]);
        
        $this->assertCount(2, $thumbnails);
        foreach ($thumbnails as $thumbnail) {
            $this->assertTrue(Storage::disk('uploads')->exists($thumbnail['path']));
        }
    }

    /** @test */
    public function it_can_validate_image_dimensions()
    {
        $validImage = UploadedFile::fake()->image('valid.jpg', 800, 600);
        $invalidImage = UploadedFile::fake()->image('invalid.jpg', 2000, 1500);
        
        $this->assertTrue(validate_image_dimensions($validImage, 1024, 768));
        $this->assertFalse(validate_image_dimensions($invalidImage, 1024, 768));
    }

    /** @test */
    public function it_can_handle_file_deletion()
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $result = handle_file_upload($file, 'documents');
        
        $this->assertTrue(handle_file_deletion($result['path']));
        $this->assertFalse(Storage::disk('uploads')->exists($result['path']));
    }

    /** @test */
    public function it_can_validate_upload_quota()
    {
        $quota = 5 * 1024 * 1024; // 5MB
        $usedSpace = 3 * 1024 * 1024; // 3MB
        $newFile = UploadedFile::fake()->create('test.pdf', 1024); // 1MB
        
        $this->assertTrue(validate_upload_quota($newFile, $quota, $usedSpace));
        
        $largeFile = UploadedFile::fake()->create('large.pdf', 3 * 1024); // 3MB
        $this->assertFalse(validate_upload_quota($largeFile, $quota, $usedSpace));
    }

    /** @test */
    public function it_can_generate_file_url()
    {
        $path = 'documents/test.pdf';
        $url = generate_file_url($path, [
            'expires' => 3600,
            'signature' => true
        ]);
        
        $this->assertStringContainsString('signature=', $url);
        $this->assertStringContainsString('expires=', $url);
    }

    /** @test */
    public function it_can_handle_file_move()
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $result = handle_file_upload($file, 'temp');
        
        $newPath = handle_file_move($result['path'], 'documents/final');
        
        $this->assertTrue(Storage::disk('uploads')->exists($newPath));
        $this->assertFalse(Storage::disk('uploads')->exists($result['path']));
    }

    /** @test */
    public function it_can_handle_file_copy()
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);
        $result = handle_file_upload($file, 'documents');
        
        $copyPath = handle_file_copy($result['path'], 'documents/backup');
        
        $this->assertTrue(Storage::disk('uploads')->exists($result['path']));
        $this->assertTrue(Storage::disk('uploads')->exists($copyPath));
    }
} 