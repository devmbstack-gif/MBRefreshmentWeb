<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotaPlanItem extends Model
{
    protected $fillable = [
        'plan_id',
        'item_id',
        'quantity',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(QuotaPlan::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
