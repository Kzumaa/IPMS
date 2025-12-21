<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\AuthorityStaff;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * List all applications for staff (with filters and pagination)
     * Staff can view all applications in the system
     */
    public function listApplications(Request $request)
    {
        $user = $request->user();

        // Ensure user is staff
        if (!$user instanceof AuthorityStaff) {
            return response()->json(['message' => 'Unauthorized - Staff only'], 403);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Staff account is inactive'], 403);
        }

        $query = Application::query()
            ->with(['metrics', 'parties', 'creator']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $query->where('status', '!=', 'DRAFT');

        // Filter by app_type
        if ($request->has('app_type')) {
            $query->where('app_type', $request->app_type);
        }

        // Filter by assigned to me
        if ($request->boolean('assigned_to_me')) {
            $query->where('current_assignee_id', $user->id);
        }

        // Search by application number or title
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('app_no', 'LIKE', "%{$search}%")
                    ->orWhere('title', 'LIKE', "%{$search}%");
            });
        }

        // Order by most recent first
        $query->orderBy('created_at', 'desc');

        $perPage = $request->input('per_page', 15);
        $applications = $query->paginate($perPage);

        return ApplicationResource::collection($applications);
    }

    /**
     * Get statistics for staff dashboard
     */
    public function getDashboardStats(Request $request)
    {
        $user = $request->user();

        // Ensure user is staff
        if (!$user instanceof AuthorityStaff) {
            return response()->json(['message' => 'Unauthorized - Staff only'], 403);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Staff account is inactive'], 403);
        }

        $stats = [
            'total_applications' => Application::count(),
            'assigned_to_me' => Application::where('current_assignee_id', $user->id)->count(),
            'pending_formality_exam' => Application::where('status', 'FORMALITY_EXAM')->count(),
            'pending_substantive_exam' => Application::where('status', 'SUB_EXAM')->count(),
            'by_status' => Application::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status'),
            'by_type' => Application::selectRaw('app_type, COUNT(*) as count')
                ->groupBy('app_type')
                ->get()
                ->pluck('count', 'app_type'),
        ];

        return response()->json(['data' => $stats]);
    }

    /**
     * Get my assigned applications
     */
    public function getMyApplications(Request $request)
    {
        $user = $request->user();

        // Ensure user is staff
        if (!$user instanceof AuthorityStaff) {
            return response()->json(['message' => 'Unauthorized - Staff only'], 403);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Staff account is inactive'], 403);
        }

        $query = Application::query()
            ->with(['metrics', 'parties', 'creator'])
            ->where('current_assignee_id', $user->id);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Order by most recent first
        $query->orderBy('created_at', 'desc');

        $perPage = $request->input('per_page', 15);
        $applications = $query->paginate($perPage);

        return ApplicationResource::collection($applications);
    }
}
