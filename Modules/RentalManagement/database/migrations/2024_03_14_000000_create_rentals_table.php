<?php
namespace Modules\RentalManagement\database\migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('rentals')) {
            Schema::create('rentals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                $table->string('rental_number')->unique();
                $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
                $table->timestamp('start_date');
                $table->timestamp('expected_end_date')->nullable();
                $table->timestamp('actual_end_date')->nullable();
                $table->string('status')->default('pending');
                $table->decimal('subtotal', 12, 2)->default(0);
                $table->decimal('tax_amount', 12, 2)->default(0);
                $table->decimal('total_amount', 12, 2)->default(0);
                $table->decimal('discount', 12, 2)->default(0);
                $table->decimal('tax', 12, 2)->default(0);
                $table->decimal('final_amount', 12, 2)->default(0);
                $table->enum('payment_status', ['pending', 'partial', 'paid', 'overdue'])->default('pending');
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('equipment_name')->nullable();
                $table->text('description')->nullable();
                // Removed foreign key to quotations to break circular dependency
                $table->unsignedBigInteger('quotation_id')->nullable();
                // $table->foreignId('quotation_id')->nullable()->constrained('quotations')->nullOnDelete();
                $table->timestamp('mobilization_date')->nullable();
                $table->timestamp('invoice_date')->nullable();
                $table->decimal('deposit_amount', 10, 2)->default(0);
                $table->integer('payment_terms_days')->default(30);
                $table->date('payment_due_date')->nullable();
                $table->boolean('has_timesheet')->default(false);
                $table->boolean('has_operators')->default(false);
                $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('completed_at')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approved_at')->nullable();
                $table->boolean('deposit_paid')->default(false);
                $table->date('deposit_paid_date')->nullable();
                $table->boolean('deposit_refunded')->default(false);
                $table->date('deposit_refund_date')->nullable();
                $table->string('invoice_id')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
