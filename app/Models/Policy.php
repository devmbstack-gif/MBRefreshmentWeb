<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Policy extends Model
{
    public const TYPE_TERMS = 'terms';

    public const TYPE_PRIVACY = 'privacy';

    protected $fillable = [
        'type',
        'text',
    ];

    public static function types(): array
    {
        return [self::TYPE_TERMS, self::TYPE_PRIVACY];
    }
}
