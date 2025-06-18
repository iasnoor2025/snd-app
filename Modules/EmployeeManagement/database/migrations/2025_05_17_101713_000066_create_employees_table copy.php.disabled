<?php
namespace Modules\EmployeeManagement\database\migrations;

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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->date('hire_date')->nullable();
            $table->string('position')->nullable();
            $table->unsignedBigInteger('department_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('active');
            $table->decimal('salary', 12, 2)->nullable();
            $table->string('salary_type')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('country')->nullable();
            $table->text('emergency_contact')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('position_id')->nullable()->constrained()->nullOnDelete();
            $table->string('designation')->nullable();
            $table->decimal('basic_salary', 10, 2)->default(0);
            $table->decimal('food_allowance', 10, 2)->default(0);
            $table->decimal('housing_allowance', 10, 2)->default(0);
            $table->decimal('transport_allowance', 10, 2)->default(0);
            $table->decimal('absent_deduction_rate', 5, 2)->default(0);
            $table->decimal('advance_payment', 10, 2)->default(0);
            $table->decimal('overtime_rate_multiplier', 5, 2)->default(1.5);
            $table->decimal('overtime_fixed_rate', 10, 2)->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_iban')->nullable();
            $table->integer('contract_hours_per_day')->default(8);
            $table->integer('contract_days_per_month')->default(22);
            $table->decimal('driving_license_cost', 10, 2)->nullable();
            $table->decimal('operator_license_cost', 10, 2)->nullable();
            $table->decimal('tuv_certification_cost', 10, 2)->nullable();
            $table->decimal('spsp_license_cost', 10, 2)->nullable();
            $table->string('nationality')->nullable();
            $table->decimal('hourly_rate', 10, 2)->default(0);
            $table->string('current_location')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('iqama_number')->nullable();
            $table->date('iqama_expiry')->nullable();
            $table->decimal('iqama_cost', 10, 2)->nullable();
            $table->string('passport_number')->nullable();
            $table->date('passport_expiry')->nullable();
            $table->string('driving_license_number')->nullable();
            $table->date('driving_license_expiry')->nullable();
            $table->string('operator_license_number')->nullable();
            $table->date('operator_license_expiry')->nullable();
            $table->string('tuv_certification_number')->nullable();
            $table->date('tuv_certification_expiry')->nullable();
            $table->string('spsp_license_number')->nullable();
            $table->date('spsp_license_expiry')->nullable();
            $table->json('custom_certifications')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
