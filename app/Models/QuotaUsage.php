<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotaUsage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'employee_id',
        'employee_quota_id',
        'item_id',
        'quantity_used',
        'used_at',
        'note',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'used_at' => 'datetime',
            'created_at' => 'datetime',
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
}
