<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class AuthorityStaff extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'authority_staff';

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'org_id',
        'role',
        'manager_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function org(): BelongsTo
    {
        return $this->belongsTo(AuthorityOrg::class, 'org_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(self::class, 'manager_id');
    }
}
