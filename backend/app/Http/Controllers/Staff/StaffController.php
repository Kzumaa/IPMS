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
            ->with(['metrics', 'parties', 'creator', 'feeQuotes']);

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

        // Filter by published and above
        if ($request->boolean('published_only')) {
            $publishedStatuses = [
                'PUBLISHED',
                'SUBSTANTIVE_CHECKING',
                'GRANTED',
                'DECLINED', // Assuming we show declined if they reached publication stage, but usually declined is end state. 
                            // Re-reading SRS: DECLINED can happen at Formality or Substantive. 
                            // SRS 3.2: Complaint flow starts after DECLINED.
                            // SRS 4.2: Publication happens after Formality Passed.
                            // So we should include statuses that imply publication occurred or is pending substantive.
                            // Let's stick to the list provided in the plan but refine based on SRS if needed.
                            // SRS: PUBLISHED -> SUBSTANTIVE_CHECKING -> GRANTED or DECLINED.
            ];
            // Since DECLINED is ambiguous (could be pre-publication), let's rely on simple state check or maybe a 'published_at' timestamp if it existed.
            // But Application model doesn't show published_at field in fillable (it might be in decision records or inferred).
            // However, SRS says: FORMALITY_PASSED -> PUBLISHED.
            // So statuses >= PUBLISHED in the workflow.
            
            // Let's use whereIn.
            $query->whereIn('status', [
                'PUBLISHED', 
                'SUBSTANTIVE_CHECKING', 
                'GRANTED',
                // 'DECLINED' - risky if declined at formality. 
                // Let's exclude DECLINED for "Published Applications" unless we can filter by previous status.
                // For now, let's stick to active published states + Granted.
                'CHANGE_REQUEST', // Post-grant
                'CHANGE_CHECKING' // Post-grant
            ]);
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

        // Get top IPC classes
        $topIpc = \App\Models\IpcClass::selectRaw('ipc_code as name, COUNT(*) as count')
            ->groupBy('ipc_code')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Get top Locarno classes (using || for PostgreSQL string concatenation)
        $topLocarno = \App\Models\LocarnoClass::selectRaw("class_no || '-' || COALESCE(subclass_no, '') as name, COUNT(*) as count")
            ->groupBy('class_no', 'subclass_no')
            ->orderByDesc('count')
            ->limit(5)
            ->get();
        
        // Merge and format
        $byClass = $topIpc->concat($topLocarno)
            ->sortByDesc('count')
            ->take(10)
            ->values();

        // Build by_status - convert enum to string for JSON keys
        $byStatusRaw = Application::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();
        $byStatus = [];
        foreach ($byStatusRaw as $item) {
            $key = $item->status instanceof \App\Enums\ApplicationStatus 
                ? $item->status->value 
                : (string) $item->status;
            $byStatus[$key] = $item->count;
        }

        // Build by_type - convert enum to string for JSON keys
        $byTypeRaw = Application::selectRaw('app_type, COUNT(*) as count')
            ->groupBy('app_type')
            ->get();
        $byType = [];
        foreach ($byTypeRaw as $item) {
            $key = $item->app_type instanceof \App\Enums\AppType 
                ? $item->app_type->value 
                : (string) $item->app_type;
            $byType[$key] = $item->count;
        }

        $stats = [
            'total_applications' => Application::count(),
            'assigned_to_me' => Application::where('current_assignee_id', $user->id)->count(),
            'pending_formality_exam' => Application::where('status', 'FORMALITY_CHECKING')->count(),
            'pending_substantive_exam' => Application::where('status', 'SUBSTANTIVE_CHECKING')->count(),
            'by_status' => $byStatus,
            'by_type' => $byType,
            'by_class' => $byClass
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
            ->with(['metrics', 'parties', 'creator', 'feeQuotes'])
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
