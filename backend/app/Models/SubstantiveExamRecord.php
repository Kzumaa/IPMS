<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubstantiveExamRecord extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'application_id', 'examiner_id', 'exam_date', 'result', 'notes'
    ];

    protected $casts = [
        'exam_date' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function examiner(): BelongsTo
    {
        return $this->belongsTo(AuthorityStaff::class, 'examiner_id');
    }
}
