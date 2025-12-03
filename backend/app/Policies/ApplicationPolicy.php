<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;
use App\Models\AuthorityStaff;

class ApplicationPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view($user, Application $application): bool
    {
        if ($user instanceof AuthorityStaff) {
            // Staff can view if they are the current assignee or if they have a role that allows viewing all (e.g. ADMIN)
            // For now, let's allow if they are the current assignee OR if they are active staff (simplification for "get info" request)
            return $user->is_active; 
        }
        return $user->id === $application->created_by;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Application $application): bool
    {
        return $user->id === $application->created_by;
    }

    public function examine($user, Application $application): bool
    {
        if ($user instanceof AuthorityStaff) {
            return $user->is_active && $user->id === $application->current_assignee_id;
        }
        return false;
    }
}
