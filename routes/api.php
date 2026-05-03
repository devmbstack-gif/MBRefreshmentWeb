<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json(['status' => 'ok']));

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}/items', [CategoryController::class, 'itemsForCategory']);
    Route::get('/banners', [BannerController::class, 'index']);

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    Route::middleware(['auth:sanctum', 'role.employee'])->prefix('employee')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}/items', [CategoryController::class, 'itemsForCategory']);
        Route::get('/items', [CategoryController::class, 'items']);
        Route::get('/quota', [EmployeeController::class, 'quota']);
        Route::post('/quota/{quota}/use', [EmployeeController::class, 'useQuota']);
        Route::get('/history', [EmployeeController::class, 'history']);
        Route::get('/notifications', [EmployeeController::class, 'notifications']);
        Route::post('/notifications/read-all', [EmployeeController::class, 'markAllNotificationsAsRead']);
        Route::post('/notifications/{notification}/read', [EmployeeController::class, 'markNotificationAsRead']);
        Route::get('/feedback', [EmployeeController::class, 'feedback']);
        Route::post('/feedback', [EmployeeController::class, 'submitFeedback']);
        Route::post('/feedback/{message}/reply', [EmployeeController::class, 'replyFeedback']);
        Route::delete('/feedback/{message}', [EmployeeController::class, 'deleteFeedback']);
        Route::post('/profile/avatar', [EmployeeController::class, 'updateProfileAvatar']);
    });
});
