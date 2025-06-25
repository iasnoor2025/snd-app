<?php

namespace Modules\EmployeeManagement\Tests\Integration\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;
use Modules\EmployeeManagement\Repositories\EmployeeDocumentRepository;
use Illuminate\Database\QueryException;
use Carbon\Carbon;

class EmployeeDocumentRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected $repository;
    protected $employee;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->repository = app(EmployeeDocumentRepository::class);
        $this->employee = Employee::factory()->create();
    }

    /** @test */
    public function it_can_create_document_with_transaction()
    {
        DB::beginTransaction();

        try {
            $document = $this->repository->create([
                'employee_id' => $this->employee->id,
                'type' => 'contract',
                'file_name' => 'contract.pdf',
                'file_path' => 'documents/contracts/contract.pdf',
                'description' => 'Employment Contract'
            ]);

            $this->assertInstanceOf(EmployeeDocument::class, $document);
            $this->assertEquals('contract', $document->type);

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
            'employee_id' => 999999, // Non-existent employee
            'type' => 'contract',
            'file_name' => 'contract.pdf',
            'file_path' => 'path/to/file.pdf'
        ]);
    }

    /** @test */
    public function it_can_retrieve_documents_with_relations()
    {
        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id
        ]);

        $retrieved = $this->repository->findWithRelations($document->id, ['employee']);

        $this->assertInstanceOf(EmployeeDocument::class, $retrieved);
        $this->assertTrue($retrieved->relationLoaded('employee'));
        $this->assertEquals($this->employee->id, $retrieved->employee->id);
    }

    /** @test */
    public function it_can_update_document_with_optimistic_locking()
    {
        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'version' => 1
        ]);

        $updated = $this->repository->updateWithVersion($document->id, [
            'description' => 'Updated description'
        ], 1);

        $this->assertTrue($updated);
        $this->assertEquals(2, $document->fresh()->version);
    }

    /** @test */
    public function it_handles_concurrent_updates()
    {
        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'version' => 1
        ]);

        // Simulate concurrent update
        DB::table('employee_documents')
            ->where('id', $document->id)
            ->update(['version' => 2]);

        $updated = $this->repository->updateWithVersion($document->id, [
            'description' => 'Updated description'
        ], 1);

        $this->assertFalse($updated);
    }

    /** @test */
    public function it_can_soft_delete_documents()
    {
        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id
        ]);

        $this->repository->delete($document->id);

        $this->assertSoftDeleted('employee_documents', [
            'id' => $document->id
        ]);
    }

    /** @test */
    public function it_can_restore_soft_deleted_documents()
    {
        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id
        ]);

        $this->repository->delete($document->id);
        $this->repository->restore($document->id);

        $this->assertDatabaseHas('employee_documents', [
            'id' => $document->id,
            'deleted_at' => null
        ]);
    }

    /** @test */
    public function it_can_paginate_documents_with_filters()
    {
        EmployeeDocument::factory()->count(15)->create([
            'employee_id' => $this->employee->id,
            'type' => 'contract'
        ]);

        EmployeeDocument::factory()->count(10)->create([
            'employee_id' => $this->employee->id,
            'type' => 'certificate'
        ]);

        $result = $this->repository->paginateWithFilters([
            'type' => 'contract',
            'per_page' => 10
        ]);

        $this->assertEquals(15, $result->total());
        $this->assertEquals(10, $result->count());
        $this->assertEquals(2, $result->lastPage());
    }

    /** @test */
    public function it_can_search_documents()
    {
        EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'file_name' => 'important_contract.pdf',
            'description' => 'Very important document'
        ]);

        $results = $this->repository->search('important');

        $this->assertCount(1, $results);
        $this->assertEquals('important_contract.pdf', $results[0]->file_name);
    }

    /** @test */
    public function it_can_handle_bulk_operations()
    {
        $documents = EmployeeDocument::factory()->count(5)->create([
            'employee_id' => $this->employee->id
        ]);

        $ids = $documents->pluck('id')->toArray();

        // Test bulk update
        $updated = $this->repository->bulkUpdate($ids, [
            'status' => 'archived'
        ]);

        $this->assertEquals(5, $updated);
        $this->assertEquals(5, EmployeeDocument::where('status', 'archived')->count());

        // Test bulk delete
        $deleted = $this->repository->bulkDelete($ids);
        $this->assertEquals(5, $deleted);
        $this->assertEquals(5, EmployeeDocument::onlyTrashed()->count());
    }

    /** @test */
    public function it_can_track_document_versions()
    {
        $document = $this->repository->create([
            'employee_id' => $this->employee->id,
            'type' => 'contract',
            'file_name' => 'contract_v1.pdf',
            'version' => 1
        ]);

        $newVersion = $this->repository->createNewVersion($document->id, [
            'file_name' => 'contract_v2.pdf',
            'version' => 2
        ]);

        $this->assertEquals(2, $newVersion->version);
        $this->assertEquals($document->id, $newVersion->previous_version_id);
    }

    /** @test */
    public function it_enforces_unique_constraints()
    {
        $this->expectException(QueryException::class);

        // Create first document
        $this->repository->create([
            'employee_id' => $this->employee->id,
            'type' => 'contract',
            'file_name' => 'unique_contract.pdf',
            'unique_identifier' => 'CONT-2024-001'
        ]);

        // Try to create another document with same unique identifier
        $this->repository->create([
            'employee_id' => $this->employee->id,
            'type' => 'contract',
            'file_name' => 'another_contract.pdf',
            'unique_identifier' => 'CONT-2024-001'
        ]);
    }

    /** @test */
    public function it_can_handle_document_expiry()
    {
        $document = $this->repository->create([
            'employee_id' => $this->employee->id,
            'type' => 'passport',
            'file_name' => 'passport.pdf',
            'expiry_date' => Carbon::now()->addYear()
        ]);

        $expiringDocs = $this->repository->findExpiringDocuments(30); // Next 30 days
        $this->assertCount(0, $expiringDocs);

        // Update expiry date to within warning period
        $document->expiry_date = Carbon::now()->addDays(15);
        $document->save();

        $expiringDocs = $this->repository->findExpiringDocuments(30);
        $this->assertCount(1, $expiringDocs);
    }

    /** @test */
    public function it_can_handle_document_categories()
    {
        $document = $this->repository->create([
            'employee_id' => $this->employee->id,
            'type' => 'contract',
            'file_name' => 'contract.pdf',
            'category' => 'employment',
            'subcategory' => 'permanent'
        ]);

        $categorized = $this->repository->findByCategory('employment', 'permanent');
        
        $this->assertCount(1, $categorized);
        $this->assertEquals($document->id, $categorized[0]->id);
    }

    /** @test */
    public function it_can_handle_document_access_logs()
    {
        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id
        ]);

        $this->repository->logAccess($document->id, [
            'user_id' => 1,
            'action' => 'view',
            'ip_address' => '127.0.0.1'
        ]);

        $logs = $this->repository->getAccessLogs($document->id);
        
        $this->assertCount(1, $logs);
        $this->assertEquals('view', $logs[0]->action);
    }
} 