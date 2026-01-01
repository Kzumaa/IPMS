<?php

use App\Http\Controllers\Application\ApplicationController;
use App\Http\Controllers\Application\ApplicationAttachmentController;
use App\Http\Controllers\Application\ApplicationClassificationController;
use App\Http\Controllers\Application\ApplicationPartyController;
use App\Http\Controllers\Application\FeeQuoteController;
use App\Http\Controllers\Application\PriorityClaimController;
use App\Http\Controllers\Application\ProtectionTitleController;
use App\Http\Controllers\Application\SntcInfoController;
use App\Http\Controllers\Application\ApplicationTimelineController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Payment\PaymentController;
use App\Http\Controllers\Payment\StripeWebhookController;
use App\Http\Controllers\Request\AmendmentController;
use App\Http\Controllers\Request\AppealController;
use App\Http\Controllers\Request\AssignmentController;
use App\Http\Controllers\Request\LicenseController;
use App\Http\Controllers\Request\SplitController;
use App\Http\Controllers\Staff\RequestExaminationController;
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

        // Timeline (aggregated events history)
        Route::get('/{application}/timeline', [ApplicationTimelineController::class, 'index']);

        // Examination (staff only)
        Route::post('/{id}/examination/complete', [ApplicationController::class, 'completeExamination']);
        Route::post('/{id}/substantive-examination/complete', [ApplicationController::class, 'completeSubstantiveExamination']);
        Route::post('/{id}/decision', [ApplicationController::class, 'issueDecision']);

        // Amendment Requests
        Route::prefix('/{id}/requests/amendments')->group(function () {
            Route::get('/', [AmendmentController::class, 'index']);
            Route::post('/', [AmendmentController::class, 'store']);
            Route::get('/{requestId}', [AmendmentController::class, 'show']);
            Route::put('/{requestId}', [AmendmentController::class, 'update']);
            Route::delete('/{requestId}', [AmendmentController::class, 'destroy']);
            Route::post('/{requestId}/submit', [AmendmentController::class, 'submit']);
        });

        // Assignment/Transfer Requests
        Route::prefix('/{id}/requests/assignments')->group(function () {
            Route::get('/', [AssignmentController::class, 'index']);
            Route::post('/', [AssignmentController::class, 'store']);
            Route::get('/{requestId}', [AssignmentController::class, 'show']);
            Route::delete('/{requestId}', [AssignmentController::class, 'destroy']);
            Route::post('/{requestId}/submit', [AssignmentController::class, 'submit']);
        });

        // License Requests
        Route::prefix('/{id}/requests/licenses')->group(function () {
            Route::get('/', [LicenseController::class, 'index']);
            Route::post('/', [LicenseController::class, 'store']);
            Route::get('/{requestId}', [LicenseController::class, 'show']);
            Route::delete('/{requestId}', [LicenseController::class, 'destroy']);
            Route::post('/{requestId}/submit', [LicenseController::class, 'submit']);
        });

        // Split Requests
        Route::prefix('/{id}/requests/splits')->group(function () {
            Route::get('/', [SplitController::class, 'index']);
            Route::post('/', [SplitController::class, 'store']);
            Route::get('/{requestId}', [SplitController::class, 'show']);
            Route::delete('/{requestId}', [SplitController::class, 'destroy']);
            Route::post('/{requestId}/submit', [SplitController::class, 'submit']);
        });

        // Appeal Requests
        Route::prefix('/{id}/requests/appeals')->group(function () {
            Route::get('/', [AppealController::class, 'index']);
            Route::post('/', [AppealController::class, 'store']);
            Route::get('/{requestId}', [AppealController::class, 'show']);
            Route::delete('/{requestId}', [AppealController::class, 'destroy']);
            Route::post('/{requestId}/submit', [AppealController::class, 'submit']);
        });
    });

    Route::get('/protection-titles/{id}/schedule', [ProtectionTitleController::class, 'getSchedule']);
    Route::post('/maintenance-fees/{id}/pay', [ProtectionTitleController::class, 'payFee']);

    // Payment routes
    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'myPayments']);
        Route::post('/checkout', [PaymentController::class, 'createCheckout']);
        Route::post('/maintenance/{scheduleId}/checkout', [PaymentController::class, 'createMaintenanceCheckout']);
        Route::get('/status/{sessionId}', [PaymentController::class, 'status']);
        Route::get('/{id}', [PaymentController::class, 'show']);
        Route::post('/{id}/refund', [PaymentController::class, 'refund']);
    });

    // Application-scoped payments
    Route::get('/applications/{applicationId}/payments', [PaymentController::class, 'index']);

    // Staff-specific routes
    Route::prefix('staff')->group(function () {
        Route::get('/applications', [StaffController::class, 'listApplications']);
        Route::get('/applications/assigned', [StaffController::class, 'getMyApplications']);
        Route::get('/dashboard/stats', [StaffController::class, 'getDashboardStats']);

        // Request examination
        Route::prefix('requests')->group(function () {
            Route::get('/', [RequestExaminationController::class, 'index']);
            Route::get('/{requestId}', [RequestExaminationController::class, 'show']);
            Route::post('/{requestId}/start-examination', [RequestExaminationController::class, 'startExamination']);
            Route::post('/{requestId}/approve', [RequestExaminationController::class, 'approve']);
            Route::post('/{requestId}/refuse', [RequestExaminationController::class, 'refuse']);
            Route::post('/{requestId}/resolve-appeal', [RequestExaminationController::class, 'resolveAppeal']);
        });
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

// Stripe webhook (no auth required - signature verified in controller)
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle']);
