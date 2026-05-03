<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealOrderRequest extends Model
{
    protected $fillable = [
        'employee_id',
        'employee_quota_id',
        'item_id',
        'quantity',
        'status',
        'requested_at',
        'processed_at',
        'processed_by_user_id',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function quota(): BelongsTo
    {
        return $this->belongsTo(EmployeeQuota::class, 'employee_quota_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }
}
