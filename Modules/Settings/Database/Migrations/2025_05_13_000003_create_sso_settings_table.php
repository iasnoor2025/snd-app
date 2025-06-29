<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sso_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('client_id');
            $table->string('client_secret');
            $table->string('discovery_url');
            $table->string('redirect_uri');
            $table->string('scopes')->default('openid email profile');
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sso_settings');
    }
};
