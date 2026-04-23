<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok']));

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    Route::middleware(['auth:sanctum', 'role.employee'])->prefix('employee')->group(function () {
        Route::get('/quota', [EmployeeController::class, 'quota']);
        Route::post('/quota/{quota}/use', [EmployeeController::class, 'useQuota']);
        Route::get('/history', [EmployeeController::class, 'history']);
        Route::get('/notifications', [EmployeeController::class, 'notifications']);
        Route::post('/notifications/{notification}/read', [EmployeeController::class, 'markNotificationAsRead']);
    });
});
