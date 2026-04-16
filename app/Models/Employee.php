<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    protected $fillable = [
        'user_id',
        'employee_code',
        'department',
        'designation',
        'joining_date',
        'fcm_token',
    ];

    protected function casts(): array
    {
        return [
            'joining_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quotas(): HasMany
    {
        return $this->hasMany(EmployeeQuota::class);
    }

    public function usages(): HasMany
    {
        return $this->hasMany(QuotaUsage::class);
    }
}
