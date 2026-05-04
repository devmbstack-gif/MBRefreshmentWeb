<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('policies', function (Blueprint $table) {
            $table->id();
            $table->string('type', 32)->unique();
            $table->longText('text');
            $table->timestamps();
        });

        $now = now();

        DB::table('policies')->insert([
            [
                'type' => 'terms',
                'text' => "Terms of use\n\nThis document describes the terms under which you may use the MB Refreshment portal. Administrators manage quota plans and inventory; employees use assigned allowances in line with company policy.\n\nBy signing in, you agree to follow applicable workplace rules and to use the system only for legitimate refreshment tracking purposes.",
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'privacy',
                'text' => "Privacy policy\n\nWe process account and usage data needed to operate the refreshment quota system (for example, your name, role, quota balances, and usage timestamps).\n\nData is used only for operational purposes within this application. Contact your administrator if you have questions about retention or access.",
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('policies');
    }
};
