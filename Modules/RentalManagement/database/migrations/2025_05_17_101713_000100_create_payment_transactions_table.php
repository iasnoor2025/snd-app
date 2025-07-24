<?php
namespace Modules\RentalManagement\Database\Migrations;

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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->onDelete('cascade');
            $table->json('payment_methods')->nullable();
            $table->json('reminder_settings')->nullable();
            $table->json('late_payment_settings')->nullable();
            $table->json('notification_settings')->nullable();
            $table->json('metadata')->nullable();
            $table->unsignedBigInteger('rental_id')->onDelete('cascade');
            $table->string('type');
            $table->decimal('amount', 10, 2);
            $table->timestamp('due_date');
            $table->string('status')->default('active');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('transaction_type');
            $table->string('payment_method');
            $table->string('reference_number')->nullable();
            $table->json('payment_details')->nullable();
            $table->decimal('original_amount', 10, 2);
            $table->decimal('penalty_amount', 10, 2);
            $table->integer('days_overdue');
            $table->unsignedBigInteger('waived_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('waived_at')->nullable();
            $table->text('waiver_reason')->nullable();
            $table->string('schedule_type');
            $table->string('frequency')->nullable();
            $table->integer('interval')->nullable();
            $table->timestamp('last_payment_at')->nullable();
            $table->timestamp('next_payment_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
