<?php
namespace Modules\EquipmentManagement\database\migrations;

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void;
     */
    public function up()
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('model_number')->nullable();
            $table->string('serial_number')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 12, 2)->nullable();
            $table->date('warranty_expiry_date')->nullable();
            $table->string('status')->default('available');
            $table->unsignedBigInteger('location_id')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('default_unit_cost', 12, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('daily_rate', 12, 2)->nullable();
            $table->decimal('weekly_rate', 12, 2)->nullable();
            $table->decimal('monthly_rate', 12, 2)->nullable();
            $table->string('erpnext_id')->nullable()->unique()->after('id');
            $table->timestamps();
            $table->softDeletes();

            // Add foreign key constraints in a separate migration to avoid circular dependencies
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void;
     */
    public function down()
    {
        Schema::dropIfExists('equipment');
    }
};


