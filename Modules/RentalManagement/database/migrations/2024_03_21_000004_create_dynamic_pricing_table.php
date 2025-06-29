<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDynamicPricingTable extends Migration
{
    public function up(): void
    {
        Schema::create('dynamic_pricing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_id')->constrained()->onDelete('cascade');
            $table->string('rule_type');
            $table->string('condition_type');
            $table->json('condition_value');
            $table->string('adjustment_type');
            $table->decimal('adjustment_value', 10, 2);
            $table->integer('priority')->default(0);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['equipment_id', 'is_active']);
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dynamic_pricing');
    }
}
