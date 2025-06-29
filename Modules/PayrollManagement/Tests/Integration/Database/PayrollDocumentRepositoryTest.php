<?php

namespace Modules\PayrollManagement\Tests\Integration\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Modules\PayrollManagement\Domain\Models\PayrollDocument;
use Modules\PayrollManagement\Domain\Models\PayrollRun;
use Modules\PayrollManagement\Repositories\PayrollDocumentRepository;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Database\QueryException;
use Carbon\Carbon;

class PayrollDocumentRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected $repository;
    protected $payrollRun;
    protected $employee;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = app(PayrollDocumentRepository::class);
        $this->employee = Employee::factory()->create();
        $this->payrollRun = PayrollRun::factory()->create([
            'period_start' => Carbon::now()->startOfMonth(),
            'period_end' => Carbon::now()->endOfMonth()
        ]);
    }

    /** @test */
    public function it_can_create_payslip_with_transaction()
    {
        DB::beginTransaction();

        try {
            $document = $this->repository->create([
                'employee_id' => $this->employee->id,
                'payroll_run_id' => $this->payrollRun->id,
                'type' => 'payslip',
                'file_name' => 'payslip_march_2024.pdf',
                'file_path' => 'documents/payroll/payslips/payslip_march_2024.pdf',
                'status' => 'generated'
            ]);

            $this->assertInstanceOf(PayrollDocument::class, $document);
            $this->assertEquals('payslip', $document->type);

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
            'payroll_run_id' => $this->payrollRun->id,
            'type' => 'payslip',
            'file_name' => 'payslip.pdf'
        ]);
    }

    /** @test */
    public function it_can_retrieve_documents_with_relations()
    {
        $document = PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id
        ]);

        $retrieved = $this->repository->findWithRelations($document->id, ['employee', 'payrollRun']);

        $this->assertInstanceOf(PayrollDocument::class, $retrieved);
        $this->assertTrue($retrieved->relationLoaded('employee'));
        $this->assertTrue($retrieved->relationLoaded('payrollRun'));
        $this->assertEquals($this->employee->id, $retrieved->employee->id);
    }

    /** @test */
    public function it_can_handle_bulk_generation()
    {
        $employees = Employee::factory()->count(5)->create();

        $documents = $this->repository->generateBulkPayslips([
            'payroll_run_id' => $this->payrollRun->id,
            'employee_ids' => $employees->pluck('id')->toArray(),
            'type' => 'payslip'
        ]);

        $this->assertCount(5, $documents);
        foreach ($documents as $document) {
            $this->assertEquals('generated', $document->status);
        }
    }

    /** @test */
    public function it_can_handle_document_distribution()
    {
        $document = PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id,
            'status' => 'generated'
        ]);

        $result = $this->repository->distributeDocument($document->id, [
            'method' => 'email',
            'recipient' => 'employee@example.com'
        ]);

        $this->assertTrue($result->success);
        $this->assertEquals('distributed', $document->fresh()->status);
    }

    /** @test */
    public function it_can_track_document_acknowledgment()
    {
        $document = PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id,
            'status' => 'distributed'
        ]);

        $acknowledgment = $this->repository->acknowledgeDocument($document->id, [
            'acknowledged_by' => $this->employee->id,
            'acknowledged_at' => Carbon::now(),
            'ip_address' => '127.0.0.1'
        ]);

        $this->assertTrue($acknowledgment->success);
        $this->assertEquals('acknowledged', $document->fresh()->status);
    }

    /** @test */
    public function it_can_handle_document_encryption()
    {
        $document = PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id
        ]);

        $encrypted = $this->repository->encryptDocument($document->id, [
            'password' => 'employee_id_123',
            'encryption_method' => 'AES-256-CBC'
        ]);

        $this->assertTrue($encrypted->is_encrypted);
        $this->assertNotNull($encrypted->encryption_details);
    }

    /** @test */
    public function it_can_handle_document_archiving()
    {
        $document = PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id,
            'status' => 'distributed'
        ]);

        $archived = $this->repository->archiveDocument($document->id, [
            'archive_reason' => 'End of retention period',
            'archived_by' => 1
        ]);

        $this->assertEquals('archived', $archived->status);
        $this->assertNotNull($archived->archived_at);
    }

    /** @test */
    public function it_can_handle_document_compliance()
    {
        $document = PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id
        ]);

        $compliance = $this->repository->updateComplianceInfo($document->id, [
            'retention_period' => '7 years',
            'compliance_status' => 'compliant',
            'last_audit_date' => Carbon::now()
        ]);

        $this->assertEquals('compliant', $compliance->compliance_status);
        $this->assertNotNull($compliance->last_audit_date);
    }

    /** @test */
    public function it_can_handle_document_versioning()
    {
        $document = PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id,
            'version' => '1.0'
        ]);

        $newVersion = $this->repository->createNewVersion($document->id, [
            'version' => '1.1',
            'changes' => 'Updated tax calculations',
            'created_by' => 1
        ]);

        $this->assertEquals('1.1', $newVersion->version);
        $this->assertEquals($document->id, $newVersion->previous_version_id);
    }

    /** @test */
    public function it_can_handle_document_signatures()
    {
        $document = PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id
        ]);

        $signature = $this->repository->addSignature($document->id, [
            'signer_id' => $this->employee->id,
            'signature_type' => 'digital',
            'signature_data' => 'base64_encoded_signature',
            'signed_at' => Carbon::now()
        ]);

        $this->assertTrue($signature->is_signed);
        $this->assertNotNull($signature->signed_at);
    }

    /** @test */
    public function it_can_handle_document_access_logs()
    {
        $document = PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id
        ]);

        $this->repository->logAccess($document->id, [
            'user_id' => 1,
            'action' => 'view',
            'ip_address' => '127.0.0.1',
            'accessed_at' => Carbon::now()
        ]);

        $logs = $this->repository->getAccessLogs($document->id);

        $this->assertCount(1, $logs);
        $this->assertEquals('view', $logs[0]->action);
    }

    /** @test */
    public function it_can_handle_document_batch_processing()
    {
        $documents = PayrollDocument::factory()->count(5)->create([
            'payroll_run_id' => $this->payrollRun->id,
            'status' => 'generated'
        ]);

        $result = $this->repository->processBatch($documents->pluck('id')->toArray(), [
            'action' => 'distribute',
            'method' => 'email'
        ]);

        $this->assertEquals(5, $result->processed_count);
        $this->assertEquals(5, PayrollDocument::where('status', 'distributed')->count());
    }

    /** @test */
    public function it_can_handle_document_search()
    {
        PayrollDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_run_id' => $this->payrollRun->id,
            'type' => 'payslip',
            'period' => '2024-03'
        ]);

        $results = $this->repository->search([
            'type' => 'payslip',
            'period' => '2024-03',
            'employee_id' => $this->employee->id
        ]);

        $this->assertCount(1, $results);
        $this->assertEquals($this->employee->id, $results[0]->employee_id);
    }

    /** @test */
    public function it_can_handle_document_statistics()
    {
        // Create documents with different statuses
        PayrollDocument::factory()->count(3)->create([
            'payroll_run_id' => $this->payrollRun->id,
            'status' => 'generated'
        ]);

        PayrollDocument::factory()->count(2)->create([
            'payroll_run_id' => $this->payrollRun->id,
            'status' => 'distributed'
        ]);

        $stats = $this->repository->getStatistics($this->payrollRun->id);

        $this->assertEquals(5, $stats->total_documents);
        $this->assertEquals(3, $stats->generated_count);
        $this->assertEquals(2, $stats->distributed_count);
    }
}
