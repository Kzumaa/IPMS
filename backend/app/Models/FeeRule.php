<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeRule extends Model
{
    public $timestamps = false;
    protected $table = 'fee_rules';
    protected $fillable = ['fee_code', 'expression', 'metric_keys', 'notes', 'law_version'];
}
