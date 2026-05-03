<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('categories');
        });

        $items = DB::table('items')->select('id', 'category')->get();

        foreach ($items as $row) {
            $name = trim((string) $row->category);
            if ($name === '') {
                continue;
            }

            $categoryId = DB::table('categories')
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
                ->value('id');

            if ($categoryId) {
                DB::table('items')->where('id', $row->id)->update(['category_id' => $categoryId]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
    }
};
