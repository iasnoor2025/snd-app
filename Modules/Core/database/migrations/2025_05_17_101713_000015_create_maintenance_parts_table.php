<?php
namespace Modules\Core\database\migrations;

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
        Schema::create('maintenance_parts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('maintenance_task_id')->onDelete('cascade');
            $table->unsignedBigInteger('inventory_item_id');
            $table->integer('quantity_required');
            $table->integer('quantity_used')->default(0);
            $table->boolean('is_reserved')->default(false);
            $table->decimal('cost_per_unit', 10, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->default(0);
            $table->string('part_number')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('reserved_by')->nullable()->constrained('users');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable()->constrained('users');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->string('storage_location')->nullable();
            $table->string('supplier')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('maintenance_record_id');
            $table->unsignedBigInteger('part_id');
            $table->integer('quantity')->default(1);
            $table->boolean('used')->default(false);
            $table->string('order_number');
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_parts');
    }
};
