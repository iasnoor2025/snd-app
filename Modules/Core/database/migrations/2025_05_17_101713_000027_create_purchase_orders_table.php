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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person');
            $table->string('email');
            $table->string('phone');
            $table->text('address');
            $table->string('status');
            $table->json('metadata')->nullable();
            $table->unsignedBigInteger('supplier_id');
            $table->decimal('total_amount', 10, 2);
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('expected_delivery_date')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('purchase_order_id')->nullable();
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->integer('current_stock');
            $table->integer('minimum_stock');
            $table->integer('reorder_point');
            $table->string('unit');
            $table->string('location');
            $table->unsignedBigInteger('stock_level_id')->nullable();
            $table->string('movement_type');
            $table->string('reference_type')->nullable();
            $table->string('reference_id')->nullable();
            $table->unsignedBigInteger('performed_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->string('po_number')->unique();
            $table->string('item_code')->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
