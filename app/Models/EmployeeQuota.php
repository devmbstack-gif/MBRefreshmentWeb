<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeQuota extends Model
{
    protected $fillable = [
        'employee_id',
        'plan_id',
        'item_id',
        'total_qty',
        'used_qty',
        'remaining_qty',
        'status',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(QuotaPlan::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function usages(): HasMany
    {
        return $this->hasMany(QuotaUsage::class);
    }
}
