<?php

use App\Http\Controllers\Application\ApplicationController;
use App\Http\Controllers\Application\FeeQuoteController;
use App\Http\Controllers\Application\ProtectionTitleController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
    return ['ok' => true, 'time' => now()];
});

Route::post('/applications/{id}/fee-quotes/generate', [FeeQuoteController::class, 'generate']);

Route::prefix('applications')->group(function () {
    Route::post('/', [ApplicationController::class, 'store']);
    Route::get('/{id}', [ApplicationController::class, 'show']);
    Route::put('/{id}', [ApplicationController::class, 'update']);
    Route::put('/{id}/metrics', [ApplicationController::class, 'updateMetrics']);
    Route::post('/{id}/submit', [ApplicationController::class, 'submit']);
    Route::post('/{id}/examination/complete', [ApplicationController::class, 'completeExamination']);
    Route::post('/{id}/substantive-examination/complete', [ApplicationController::class, 'completeSubstantiveExamination']);
    Route::post('/{id}/decision', [ApplicationController::class, 'issueDecision']);
});

Route::get('/protection-titles/{id}/schedule', [ProtectionTitleController::class, 'getSchedule']);
Route::post('/maintenance-fees/{id}/pay', [ProtectionTitleController::class, 'payFee']);


Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'registerApplicant']);   // user register
    Route::post('/login', [AuthController::class, 'loginApplicant']);        // user login
});

// Staff side
Route::prefix('auth/staff')->group(function () {
    Route::post('/login', [AuthController::class, 'loginStaff']);            // staff login
});

// Common authenticated endpoints (token can belong to user OR staff)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);      // returns type + data
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
