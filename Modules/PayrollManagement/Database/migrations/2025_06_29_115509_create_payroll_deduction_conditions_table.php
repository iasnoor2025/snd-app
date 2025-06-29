<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payroll_deduction_conditions', function (Blueprint $table) {
            $table->id();
            $table->string('field');
            $table->string('operator');
            $table->string('value');
            $table->decimal('amount', 15, 2)->nullable();
            $table->decimal('percentage', 8, 2)->nullable();
            $table->json('metadata')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deduction_rule_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('deduction_rule_id')
                ->references('id')->on('payroll_deduction_rules')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('payroll_deduction_conditions');
    }
};
