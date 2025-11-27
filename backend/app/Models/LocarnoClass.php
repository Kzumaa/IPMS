<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocarnoClass extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'locarno_classes';
    protected $fillable = ['application_id', 'class_no', 'subclass_no', 'version', 'field_of_use', 'sort_order'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
