<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('fcm_token')->nullable()->after('remember_token');
            $table->string('fcm_platform', 20)->nullable()->after('fcm_token');
            $table->timestamp('fcm_updated_at')->nullable()->after('fcm_platform');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['fcm_token', 'fcm_platform', 'fcm_updated_at']);
        });
    }
};
