<?php

use App\Http\Controllers\Web\Admin\DashboardController;
use App\Http\Controllers\Web\Admin\EmployeeController;
use App\Http\Controllers\Web\Admin\ItemController;
use App\Http\Controllers\Web\Admin\QuotaPlanController;
use App\Http\Controllers\Web\Employee\QuotaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth'])->get('/dashboard', function (Request $request) {
    if ($request->user()->isSuperAdmin()) {
        return redirect()->route('admin.dashboard');
    }

    return redirect()->route('employee.quota.index');
})->name('dashboard');

Route::middleware(['auth', 'role.admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
        Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
        Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
        Route::patch('/employees/{employee}/toggle-status', [EmployeeController::class, 'toggleStatus'])->name('employees.toggle-status');
        Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');

        Route::get('/items', [ItemController::class, 'index'])->name('items.index');
        Route::post('/items', [ItemController::class, 'store'])->name('items.store');
        Route::put('/items/{item}', [ItemController::class, 'update'])->name('items.update');
        Route::delete('/items/{item}', [ItemController::class, 'destroy'])->name('items.destroy');

        Route::get('/plans', [QuotaPlanController::class, 'index'])->name('plans.index');
        Route::post('/plans', [QuotaPlanController::class, 'store'])->name('plans.store');
        Route::post('/plans/{plan}/assign', [QuotaPlanController::class, 'assign'])->name('plans.assign');
        Route::patch('/plans/{plan}/toggle-status', [QuotaPlanController::class, 'toggleStatus'])->name('plans.toggle-status');
    });

Route::middleware(['auth', 'role.employee'])
    ->prefix('employee')
    ->name('employee.')
    ->group(function () {
        Route::get('/quota', [QuotaController::class, 'index'])->name('quota.index');
        Route::post('/quota/{quota}/use', [QuotaController::class, 'use'])->name('quota.use');
        Route::get('/history', [QuotaController::class, 'history'])->name('history.index');
    });

require __DIR__.'/settings.php';
