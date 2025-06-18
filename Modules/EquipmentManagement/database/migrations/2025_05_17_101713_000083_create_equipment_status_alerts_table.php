<?php
namespace Modules\EquipmentManagement\database\migrations;

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
        Schema::create('equipment_status_alerts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipment_id')->onDelete('cascade');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('altitude', 10, 2)->nullable();
            $table->decimal('speed', 10, 2)->nullable();
            $table->decimal('heading', 5, 2)->nullable();
            $table->decimal('accuracy', 10, 2)->nullable();
            $table->string('status')->default('active');
            $table->string('battery_level')->nullable();
            $table->string('signal_strength')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('last_updated_at');
            $table->decimal('start_latitude', 10, 8);
            $table->decimal('start_longitude', 11, 8);
            $table->decimal('end_latitude', 10, 8);
            $table->decimal('end_longitude', 11, 8);
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->decimal('distance', 10, 2)->nullable();
            $table->decimal('average_speed', 10, 2)->nullable();
            $table->string('movement_type')->nullable();
            $table->unsignedBigInteger('rental_id')->nullable()->constrained('rentals')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->string('alert_type');
            $table->string('severity');
            $table->text('message');
            $table->json('location_data')->nullable();
            $table->unsignedBigInteger('acknowledged_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->string('name');
            $table->string('type');
            $table->text('description')->nullable();
            $table->json('coordinates');
            $table->decimal('radius', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('alert_settings')->nullable();
            $table->unsignedBigInteger('geofence_zone_id')->onDelete('cascade');
            $table->string('event_type');
            $table->timestamp('event_time');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_status_alerts');
    }
};
