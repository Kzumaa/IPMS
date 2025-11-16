<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuthorityStaff extends Model
{
    public $timestamps = false;
    protected $fillable = ['user_id', 'org_id', 'role', 'manager_id', 'is_active'];


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function org(): BelongsTo
    {
        return $this->belongsTo(AuthorityOrg::class, 'org_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(self::class, 'manager_id');
    }
}
