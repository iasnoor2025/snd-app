<?php

namespace Modules\EquipmentManagement\Tests\Integration\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentMedia;
use Modules\EquipmentManagement\Repositories\EquipmentMediaRepository;
use Illuminate\Database\QueryException;
use Carbon\Carbon;

class EquipmentMediaRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected $repository;
    protected $equipment;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->repository = app(EquipmentMediaRepository::class);
        $this->equipment = Equipment::factory()->create();
    }

    /** @test */
    public function it_can_create_media_with_transaction()
    {
        DB::beginTransaction();

        try {
            $media = $this->repository->create([
                'equipment_id' => $this->equipment->id,
                'type' => 'image',
                'file_name' => 'equipment.jpg',
                'file_path' => 'media/equipment/equipment.jpg',
                'mime_type' => 'image/jpeg',
                'description' => 'Equipment Photo'
            ]);

            $this->assertInstanceOf(EquipmentMedia::class, $media);
            $this->assertEquals('image', $media->type);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /** @test */
    public function it_enforces_foreign_key_constraints()
    {
        $this->expectException(QueryException::class);

        $this->repository->create([
            'equipment_id' => 999999, // Non-existent equipment
            'type' => 'image',
            'file_name' => 'equipment.jpg',
            'file_path' => 'path/to/file.jpg'
        ]);
    }

    /** @test */
    public function it_can_retrieve_media_with_relations()
    {
        $media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id
        ]);

        $retrieved = $this->repository->findWithRelations($media->id, ['equipment']);

        $this->assertInstanceOf(EquipmentMedia::class, $retrieved);
        $this->assertTrue($retrieved->relationLoaded('equipment'));
        $this->assertEquals($this->equipment->id, $retrieved->equipment->id);
    }

    /** @test */
    public function it_can_handle_media_optimization()
    {
        $media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id,
            'type' => 'image',
            'file_size' => 1000000 // 1MB
        ]);

        $optimized = $this->repository->optimizeMedia($media->id, [
            'quality' => 80,
            'max_width' => 1920,
            'max_height' => 1080
        ]);

        $this->assertLessThan(1000000, $optimized->file_size);
    }

    /** @test */
    public function it_can_handle_media_variants()
    {
        $media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id,
            'type' => 'image'
        ]);

        $variants = $this->repository->createVariants($media->id, [
            'thumbnail' => ['width' => 150, 'height' => 150],
            'medium' => ['width' => 800, 'height' => 600],
            'large' => ['width' => 1920, 'height' => 1080]
        ]);

        $this->assertCount(3, $variants);
        $this->assertEquals('thumbnail', $variants[0]->variant_name);
    }

    /** @test */
    public function it_can_handle_media_metadata()
    {
        $media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id,
            'type' => 'image'
        ]);

        $this->repository->updateMetadata($media->id, [
            'dimensions' => ['width' => 1920, 'height' => 1080],
            'taken_at' => '2024-03-21',
            'camera' => 'iPhone 12 Pro',
            'location' => ['lat' => 25.2048, 'lng' => 55.2708]
        ]);

        $metadata = $this->repository->getMetadata($media->id);
        $this->assertEquals(1920, $metadata['dimensions']['width']);
        $this->assertEquals('iPhone 12 Pro', $metadata['camera']);
    }

    /** @test */
    public function it_can_handle_media_tags()
    {
        $media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id
        ]);

        $this->repository->addTags($media->id, ['front-view', 'damage', 'repair-needed']);

        $tags = $this->repository->getTags($media->id);
        $this->assertCount(3, $tags);

        // Search by tags
        $mediaItems = $this->repository->findByTags(['damage', 'repair-needed']);
        $this->assertCount(1, $mediaItems);
    }

    /** @test */
    public function it_can_handle_media_categories()
    {
        $media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id,
            'category' => 'maintenance',
            'subcategory' => 'repairs'
        ]);

        $categorized = $this->repository->findByCategory('maintenance', 'repairs');
        
        $this->assertCount(1, $categorized);
        $this->assertEquals($media->id, $categorized[0]->id);
    }

    /** @test */
    public function it_can_handle_media_access_logs()
    {
        $media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id
        ]);

        $this->repository->logAccess($media->id, [
            'user_id' => 1,
            'action' => 'view',
            'ip_address' => '127.0.0.1'
        ]);

        $logs = $this->repository->getAccessLogs($media->id);
        
        $this->assertCount(1, $logs);
        $this->assertEquals('view', $logs[0]->action);
    }

    /** @test */
    public function it_can_handle_media_bulk_operations()
    {
        $mediaItems = EquipmentMedia::factory()->count(5)->create([
            'equipment_id' => $this->equipment->id
        ]);

        $ids = $mediaItems->pluck('id')->toArray();

        // Test bulk update
        $updated = $this->repository->bulkUpdate($ids, [
            'status' => 'archived'
        ]);

        $this->assertEquals(5, $updated);
        $this->assertEquals(5, EquipmentMedia::where('status', 'archived')->count());

        // Test bulk delete
        $deleted = $this->repository->bulkDelete($ids);
        $this->assertEquals(5, $deleted);
        $this->assertEquals(5, EquipmentMedia::onlyTrashed()->count());
    }

    /** @test */
    public function it_can_handle_media_ordering()
    {
        $media1 = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id,
            'display_order' => 1
        ]);

        $media2 = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id,
            'display_order' => 2
        ]);

        $this->repository->updateOrder([
            $media1->id => 2,
            $media2->id => 1
        ]);

        $this->assertEquals(2, $media1->fresh()->display_order);
        $this->assertEquals(1, $media2->fresh()->display_order);
    }

    /** @test */
    public function it_can_handle_media_galleries()
    {
        $gallery = $this->repository->createGallery([
            'equipment_id' => $this->equipment->id,
            'name' => 'Maintenance Photos',
            'description' => 'Photos from recent maintenance'
        ]);

        $media = EquipmentMedia::factory()->count(3)->create([
            'equipment_id' => $this->equipment->id
        ]);

        $this->repository->addToGallery($gallery->id, $media->pluck('id')->toArray());

        $galleryItems = $this->repository->getGalleryItems($gallery->id);
        $this->assertCount(3, $galleryItems);
    }

    /** @test */
    public function it_can_handle_media_transformations()
    {
        $media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id,
            'type' => 'image'
        ]);

        $transformed = $this->repository->applyTransformations($media->id, [
            'rotate' => 90,
            'crop' => ['x' => 0, 'y' => 0, 'width' => 800, 'height' => 600],
            'brightness' => 10,
            'contrast' => 15
        ]);

        $this->assertNotNull($transformed);
        $this->assertNotEquals($media->file_path, $transformed->file_path);
    }

    /** @test */
    public function it_can_handle_media_validation()
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->repository->create([
            'equipment_id' => $this->equipment->id,
            'type' => 'image',
            'file_name' => 'invalid.xyz', // Invalid extension
            'mime_type' => 'invalid/type'
        ]);
    }

    /** @test */
    public function it_can_handle_media_usage_tracking()
    {
        $media = EquipmentMedia::factory()->create([
            'equipment_id' => $this->equipment->id
        ]);

        $this->repository->trackUsage($media->id, [
            'context' => 'report',
            'user_id' => 1,
            'timestamp' => Carbon::now()
        ]);

        $usage = $this->repository->getUsageStats($media->id);
        $this->assertCount(1, $usage);
        $this->assertEquals('report', $usage[0]->context);
    }
} 