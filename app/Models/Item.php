<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $fillable = [
        'name',
        'category',
        'category_id',
        'description',
        'stock_quantity',
        'low_stock_threshold',
        'image_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'category_id' => 'integer',
        ];
    }

    public function catalogCategory(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function planItems(): HasMany
    {
        return $this->hasMany(QuotaPlanItem::class);
    }

    public function employeeQuotas(): HasMany
    {
        return $this->hasMany(EmployeeQuota::class);
    }
}
