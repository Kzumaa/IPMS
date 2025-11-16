<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeCatalog extends Model
{
    public $timestamps = false;
    protected $table = 'fee_catalog';
    protected $fillable = ['code', 'app_type', 'label', 'basis', 'unit_price', 'unit_name', 'law_version', 'effective_from', 'effective_to'];
}
