<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE items MODIFY category VARCHAR(100) NOT NULL DEFAULT 'other'");
    }

    public function down(): void
    {
        DB::statement("UPDATE items SET category = 'other' WHERE category NOT IN ('food', 'beverage', 'snack', 'other')");
        DB::statement("ALTER TABLE items MODIFY category ENUM('food', 'beverage', 'snack', 'other') NOT NULL DEFAULT 'other'");
    }
};
