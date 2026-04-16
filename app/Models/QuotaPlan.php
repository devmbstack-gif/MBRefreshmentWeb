<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuotaPlan extends Model
{
    protected $fillable = [
        'title',
        'description',
        'period_type',
        'starts_at',
        'ends_at',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'date',
            'ends_at' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function planItems(): HasMany
    {
        return $this->hasMany(QuotaPlanItem::class, 'plan_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function employeeQuotas(): HasMany
    {
        return $this->hasMany(EmployeeQuota::class, 'plan_id');
    }
}
