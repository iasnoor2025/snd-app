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
        Schema::create('rental_timesheets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rental_id')->cascadeOnDelete();
            $table->unsignedBigInteger('rental_item_id')->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->decimal('hours_used', 5, 2)->default(0);
            $table->string('status')->default('completed')->after('notes');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('operator_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->unsignedBigInteger('created_by')->cascadeOnDelete();
            $table->unsignedBigInteger('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->unsignedBigInteger('equipment_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('rate', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->timestamp('status_updated_at')->nullable()->after('status');
            $table->unsignedBigInteger('status_updated_by')->nullable()->after('status_updated_at')
                    ->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_timesheets');
    }
};
