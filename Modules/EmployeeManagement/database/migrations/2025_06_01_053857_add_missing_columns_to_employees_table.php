<?php

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
        Schema::table('employees', function (Blueprint $table) {
            // Add missing salary and rate columns
            $table->decimal('hourly_rate', 10, 2)->default(0)->after('basic_salary');
            $table->decimal('absent_deduction_rate', 5, 2)->default(0)->after('hourly_rate');
            $table->decimal('advance_payment', 10, 2)->default(0)->after('absent_deduction_rate');
            $table->decimal('overtime_rate_multiplier', 5, 2)->default(1.5)->after('advance_payment');
            $table->decimal('overtime_fixed_rate', 10, 2)->nullable()->after('overtime_rate_multiplier');

            // Add contract details
            $table->integer('contract_hours_per_day')->default(8)->after('overtime_fixed_rate');
            $table->integer('contract_days_per_month')->default(22)->after('contract_hours_per_day');

            // Add supervisor
            $table->string('supervisor')->nullable()->after('contract_days_per_month');

            // Add emergency contact details
            $table->string('emergency_contact_name')->nullable()->after('supervisor');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');

            // Add document details
            $table->string('iqama_number')->nullable()->after('emergency_contact_phone');
            $table->date('iqama_expiry')->nullable()->after('iqama_number');
            $table->decimal('iqama_cost', 10, 2)->nullable()->after('iqama_expiry');
            $table->string('passport_number')->nullable()->after('iqama_cost');
            $table->date('passport_expiry')->nullable()->after('passport_number');

            // Add custom certifications
            $table->json('custom_certifications')->nullable()->after('passport_expiry');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'hourly_rate',
                'absent_deduction_rate',
                'advance_payment',
                'overtime_rate_multiplier',
                'overtime_fixed_rate',
                'contract_hours_per_day',
                'contract_days_per_month',
                'supervisor',
                'emergency_contact_name',
                'emergency_contact_phone',
                'iqama_number',
                'iqama_expiry',
                'iqama_cost',
                'passport_number',
                'passport_expiry',
                'custom_certifications'
            ]);
        });
    }
};
