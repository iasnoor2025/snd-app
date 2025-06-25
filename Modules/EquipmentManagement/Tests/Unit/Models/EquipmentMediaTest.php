<?php

namespace Modules\EquipmentManagement\Tests\Unit\Models;

use Tests\TestCase;
use Modules\EquipmentManagement\Models\Equipment;
use Modules\EquipmentManagement\Models\EquipmentMedia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class EquipmentMediaTest extends TestCase
{
    use RefreshDatabase;

    protected EquipmentMedia $media;
    protected Equipment $equipment;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->equipment = Equipment::factory()->create([
            'name' => 'Test Equipment',
            'code' => 'EQP001',
            'status' => 'active'
        ]);
        
        $this->media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id,
            'title' => 'Equipment Manual',
            'type' => 'manual',
            'file_path' => 'equipment/EQP001/manual.pdf',
            'mime_type' => 'application/pdf',
            'size' => 1024,
            'status' => 'active',
            'metadata' => [
                'language' => 'English',
                'version' => '1.0',
                'tags' => ['manual', 'documentation']
            ]
        ]);

        // Create necessary directories
        Storage::makeDirectory('equipment/EQP001');
    }

    protected function tearDown(): void
    {
        Storage::deleteDirectory('equipment');
        parent::tearDown();
    }

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $fillable = [
            'equipment_id',
            'title',
            'type',
            'file_path',
            'mime_type',
            'size',
            'status',
            'metadata',
            'description',
            'created_by',
            'updated_by'
        ];

        $this->assertEquals($fillable, $this->media->getFillable());
    }

    /** @test */
    public function it_has_correct_casts()
    {
        $expectedCasts = [
            'id' => 'integer',
            'equipment_id' => 'integer',
            'size' => 'integer',
            'metadata' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'created_by' => 'integer',
            'updated_by' => 'integer'
        ];

        $this->assertEquals($expectedCasts, $this->media->getCasts());
    }

    /** @test */
    public function it_belongs_to_equipment()
    {
        $this->assertInstanceOf(BelongsTo::class, $this->media->equipment());
        $this->assertInstanceOf(Equipment::class, $this->media->equipment);
        $this->assertEquals($this->equipment->id, $this->media->equipment->id);
    }

    /** @test */
    public function it_can_scope_by_type()
    {
        EquipmentMedia::factory()->create(['type' => 'photo']);
        EquipmentMedia::factory()->create(['type' => 'manual']);

        $manuals = EquipmentMedia::byType('manual')->get();

        $this->assertEquals(2, $manuals->count());
        $this->assertEquals('manual', $manuals->first()->type);
    }

    /** @test */
    public function it_can_scope_by_mime_type()
    {
        EquipmentMedia::factory()->create(['mime_type' => 'image/jpeg']);
        EquipmentMedia::factory()->create(['mime_type' => 'application/pdf']);

        $pdfs = EquipmentMedia::byMimeType('application/pdf')->get();

        $this->assertEquals(2, $pdfs->count());
        $this->assertEquals('application/pdf', $pdfs->first()->mime_type);
    }

    /** @test */
    public function it_can_get_file_url()
    {
        $expectedUrl = url('storage/equipment/EQP001/manual.pdf');
        $this->assertEquals($expectedUrl, $this->media->file_url);
    }

    /** @test */
    public function it_can_get_download_url()
    {
        $expectedUrl = route('equipment.media.download', $this->media->id);
        $this->assertEquals($expectedUrl, $this->media->download_url);
    }

    /** @test */
    public function it_can_get_thumbnail_url()
    {
        $this->media->metadata = array_merge(
            $this->media->metadata,
            ['thumbnail_path' => 'equipment/EQP001/thumbnails/manual.jpg']
        );

        $expectedUrl = url('storage/equipment/EQP001/thumbnails/manual.jpg');
        $this->assertEquals($expectedUrl, $this->media->thumbnail_url);
    }

    /** @test */
    public function it_can_get_formatted_size()
    {
        $this->media->size = 1024 * 1024; // 1MB
        $this->assertEquals('1.00 MB', $this->media->formatted_size);

        $this->media->size = 1024; // 1KB
        $this->assertEquals('1.00 KB', $this->media->formatted_size);
    }

    /** @test */
    public function it_can_get_metadata_value()
    {
        $this->assertEquals('English', $this->media->getMetadata('language'));
        $this->assertEquals(['manual', 'documentation'], $this->media->getMetadata('tags'));
        $this->assertNull($this->media->getMetadata('non_existent'));
    }

    /** @test */
    public function it_can_update_metadata()
    {
        $this->media->updateMetadata('language', 'Spanish');
        $this->assertEquals('Spanish', $this->media->getMetadata('language'));

        $this->media->updateMetadata('tags', ['manual', 'updated']);
        $this->assertEquals(['manual', 'updated'], $this->media->getMetadata('tags'));
    }

    /** @test */
    public function it_can_check_if_image()
    {
        $this->media->mime_type = 'image/jpeg';
        $this->assertTrue($this->media->isImage());

        $this->media->mime_type = 'application/pdf';
        $this->assertFalse($this->media->isImage());
    }

    /** @test */
    public function it_can_check_if_document()
    {
        $this->media->mime_type = 'application/pdf';
        $this->assertTrue($this->media->isDocument());

        $this->media->mime_type = 'image/jpeg';
        $this->assertFalse($this->media->isDocument());
    }

    /** @test */
    public function it_can_get_related_media()
    {
        EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id,
            'type' => 'photo',
            'metadata' => ['related_to' => $this->media->id]
        ]);

        $related = $this->media->getRelatedMedia();

        $this->assertCount(1, $related);
        $this->assertEquals('photo', $related->first()->type);
    }

    /** @test */
    public function it_can_generate_audit_trail()
    {
        $this->media->metadata = array_merge(
            $this->media->metadata,
            [
                'audit_trail' => [
                    ['action' => 'uploaded', 'by' => 1, 'at' => now()->subDays(2)],
                    ['action' => 'viewed', 'by' => 2, 'at' => now()->subDay()]
                ]
            ]
        );

        $auditTrail = $this->media->getAuditTrail();

        $this->assertCount(2, $auditTrail);
        $this->assertEquals('viewed', $auditTrail[1]['action']);
    }

    /** @test */
    public function it_can_handle_media_processing_status()
    {
        $this->media->updateProcessingStatus('processing');
        $this->assertEquals('processing', $this->media->getMetadata('processing_status'));

        $this->media->updateProcessingStatus('completed');
        $this->assertEquals('completed', $this->media->getMetadata('processing_status'));
    }

    /** @test */
    public function it_can_track_download_count()
    {
        $this->media->incrementDownloadCount();
        $this->assertEquals(1, $this->media->getMetadata('download_count'));

        $this->media->incrementDownloadCount();
        $this->assertEquals(2, $this->media->getMetadata('download_count'));
    }
} 