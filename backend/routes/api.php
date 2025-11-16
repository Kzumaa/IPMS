<?php

use App\Http\Controllers\Application\FeeQuoteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
    return ['ok' => true, 'time' => now()];
});

Route::post('/applications/{id}/fee-quotes/generate', [FeeQuoteController::class, 'generate']);
