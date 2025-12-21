<?php

use App\Http\Controllers\Application\ApplicationController;
use App\Http\Controllers\Application\ApplicationAttachmentController;
use App\Http\Controllers\Application\ApplicationClassificationController;
use App\Http\Controllers\Application\ApplicationPartyController;
use App\Http\Controllers\Application\FeeQuoteController;
use App\Http\Controllers\Application\PriorityClaimController;
use App\Http\Controllers\Application\ProtectionTitleController;
use App\Http\Controllers\Application\SntcInfoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Staff\StaffController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
    return ['ok' => true, 'time' => now()];
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('applications')->group(function () {
        // Application CRUD
        Route::get('/', [ApplicationController::class, 'index']);
        Route::post('/', [ApplicationController::class, 'store']);
        Route::get('/{id}', [ApplicationController::class, 'show']);
        Route::put('/{id}', [ApplicationController::class, 'update']);
        Route::delete('/{id}', [ApplicationController::class, 'destroy']);

        // Application actions
        Route::put('/{id}/metrics', [ApplicationController::class, 'updateMetrics']);
        Route::post('/{id}/submit', [ApplicationController::class, 'submit']);
        Route::post('/{id}/analyze', [ApplicationController::class, 'analyze']);

        // Parties
        Route::get('/{id}/parties', [ApplicationPartyController::class, 'index']);
        Route::post('/{id}/parties', [ApplicationPartyController::class, 'store']);
        Route::put('/{id}/parties/{partyId}', [ApplicationPartyController::class, 'update']);
        Route::delete('/{id}/parties/{partyId}', [ApplicationPartyController::class, 'destroy']);

        // Attachments
        Route::get('/{id}/attachments', [ApplicationAttachmentController::class, 'index']);
        Route::post('/{id}/attachments', [ApplicationAttachmentController::class, 'store']);
        Route::delete('/{id}/attachments/{attachmentId}', [ApplicationAttachmentController::class, 'destroy']);
        Route::get('/{id}/attachments/{attachmentId}/download', [ApplicationAttachmentController::class, 'download']);
        Route::get('/{id}/attachments/{attachmentId}/preview', [ApplicationAttachmentController::class, 'preview']);

        // Protection Titles (IPC/Locarno Classifications)
        Route::get('/{id}/protection-titles', [ApplicationClassificationController::class, 'index']);
        Route::post('/{id}/protection-titles', [ApplicationClassificationController::class, 'store']);
        Route::delete('/{id}/protection-titles/{titleId}', [ApplicationClassificationController::class, 'destroy']);

        // Priority Claims
        Route::get('/{id}/priority-claims', [PriorityClaimController::class, 'index']);
        Route::post('/{id}/priority-claims', [PriorityClaimController::class, 'store']);
        Route::put('/{id}/priority-claims/{claimId}', [PriorityClaimController::class, 'update']);
        Route::delete('/{id}/priority-claims/{claimId}', [PriorityClaimController::class, 'destroy']);

        // SNTC Info (State Budget Science & Technology Task)
        Route::get('/{id}/sntc-info', [SntcInfoController::class, 'show']);
        Route::post('/{id}/sntc-info', [SntcInfoController::class, 'store']);
        Route::delete('/{id}/sntc-info', [SntcInfoController::class, 'destroy']);

        // Fee Quotes
        Route::get('/{id}/fee-quotes', [FeeQuoteController::class, 'index']);
        Route::post('/{id}/fee-quotes/generate', [FeeQuoteController::class, 'generate']);
        Route::post('/{id}/calculate-fees', [FeeQuoteController::class, 'generate']); // Alias for frontend compatibility

        // Examination (staff only)
        Route::post('/{id}/examination/complete', [ApplicationController::class, 'completeExamination']);
        Route::post('/{id}/substantive-examination/complete', [ApplicationController::class, 'completeSubstantiveExamination']);
        Route::post('/{id}/decision', [ApplicationController::class, 'issueDecision']);
    });

    Route::get('/protection-titles/{id}/schedule', [ProtectionTitleController::class, 'getSchedule']);
    Route::post('/maintenance-fees/{id}/pay', [ProtectionTitleController::class, 'payFee']);

    // Staff-specific routes
    Route::prefix('staff')->group(function () {
        Route::get('/applications', [StaffController::class, 'listApplications']);
        Route::get('/applications/assigned', [StaffController::class, 'getMyApplications']);
        Route::get('/dashboard/stats', [StaffController::class, 'getDashboardStats']);
    });

    Route::get('/auth/me', [AuthController::class, 'me']);      // returns type + data
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User search (for adding co-applicants)
    Route::get('/users/search', [AuthController::class, 'searchByEmail']);
});


Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'registerApplicant']);   // user register
    Route::post('/login', [AuthController::class, 'loginApplicant']);        // user login
});

// Staff side
Route::prefix('auth/staff')->group(function () {
    Route::post('/login', [AuthController::class, 'loginStaff']);            // staff login
});


