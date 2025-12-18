<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\IpcClass;
use App\Models\LocarnoClass;
use Illuminate\Http\Request;

class ApplicationClassificationController extends Controller
{
    /**
     * Get all classifications (IPC/Locarno) for an application
     */
    public function index($applicationId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $ipcClasses = $application->ipcClasses()->orderBy('sort_order')->get();
        $locarnoClasses = $application->locarnoClasses()->orderBy('sort_order')->get();

        // Transform to frontend format (protection_titles)
        $protectionTitles = [];

        foreach ($ipcClasses as $ipc) {
            $protectionTitles[] = [
                'id' => $ipc->id,
                'application_id' => $ipc->application_id,
                'title_type' => 'IPC',
                'class_code' => $ipc->ipc_code,
                'class_name' => null,
                'subclass_code' => null,
                'subclass_name' => null,
                'created_at' => null,
                'updated_at' => null,
            ];
        }

        foreach ($locarnoClasses as $locarno) {
            $protectionTitles[] = [
                'id' => $locarno->id,
                'application_id' => $locarno->application_id,
                'title_type' => 'LOCARNO',
                'class_code' => $locarno->class_no,
                'class_name' => null,
                'subclass_code' => $locarno->subclass_no,
                'subclass_name' => null,
                'created_at' => null,
                'updated_at' => null,
            ];
        }

        return response()->json(['data' => $protectionTitles]);
    }

    /**
     * Add a classification to an application
     */
    public function store(Request $request, $applicationId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'title_type' => 'required|in:IPC,LOCARNO,NICE',
            'class_code' => 'required|string|max:50',
            'subclass_code' => 'nullable|string|max:50',
        ]);

        if ($validated['title_type'] === 'IPC') {
            // Add IPC classification
            $ipc = IpcClass::create([
                'application_id' => $application->id,
                'ipc_code' => $validated['class_code'],
                'version' => null,
                'sort_order' => $application->ipcClasses()->count(),
            ]);

            return response()->json([
                'data' => [
                    'id' => $ipc->id,
                    'application_id' => $ipc->application_id,
                    'title_type' => 'IPC',
                    'class_code' => $ipc->ipc_code,
                    'class_name' => null,
                    'subclass_code' => null,
                    'subclass_name' => null,
                    'created_at' => null,
                    'updated_at' => null,
                ]
            ], 201);
        } elseif ($validated['title_type'] === 'LOCARNO') {
            // Add Locarno classification
            $locarno = LocarnoClass::create([
                'application_id' => $application->id,
                'class_no' => $validated['class_code'],
                'subclass_no' => $validated['subclass_code'] ?? null,
                'version' => null,
                'field_of_use' => null,
                'sort_order' => $application->locarnoClasses()->count(),
            ]);

            return response()->json([
                'data' => [
                    'id' => $locarno->id,
                    'application_id' => $locarno->application_id,
                    'title_type' => 'LOCARNO',
                    'class_code' => $locarno->class_no,
                    'class_name' => null,
                    'subclass_code' => $locarno->subclass_no,
                    'subclass_name' => null,
                    'created_at' => null,
                    'updated_at' => null,
                ]
            ], 201);
        }

        return response()->json(['message' => 'NICE classifications not supported yet'], 400);
    }

    /**
     * Delete a classification
     */
    public function destroy($applicationId, $titleId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        // Try to find in IPC first, then Locarno
        $ipc = IpcClass::where('application_id', $applicationId)
            ->where('id', $titleId)
            ->first();

        if ($ipc) {
            $ipc->delete();
            return response()->json(['message' => 'IPC classification deleted successfully'], 200);
        }

        $locarno = LocarnoClass::where('application_id', $applicationId)
            ->where('id', $titleId)
            ->first();

        if ($locarno) {
            $locarno->delete();
            return response()->json(['message' => 'Locarno classification deleted successfully'], 200);
        }

        return response()->json(['message' => 'Classification not found'], 404);
    }
}
