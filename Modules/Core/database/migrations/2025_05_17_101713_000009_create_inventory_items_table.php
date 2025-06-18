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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->nullable();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->integer('min_quantity')->default(0);
            $table->decimal('unit_price', 12, 2)->nullable();
            $table->string('unit_of_measure')->nullable();
            $table->string('status')->default('active');
            $table->unsignedBigInteger('location_id')->nullable();
            $table->string('storage_location')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('unit');
            $table->decimal('minimum_stock', 10, 2)->default(0);
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->decimal('unit_cost', 10, 2);
            $table->string('location')->nullable();
            $table->string('supplier')->nullable();
            $table->json('specifications')->nullable();
            $table->unsignedBigInteger('item_id')->nullable();
            $table->string('type');
            $table->decimal('total_cost', 10, 2);
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->string('adjustment_type');
            $table->string('reason');
            $table->unsignedBigInteger('adjusted_by');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->string('code')->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
