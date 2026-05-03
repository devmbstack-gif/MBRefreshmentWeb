<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Employee;
use App\Models\EmployeeQuota;
use App\Models\Item;
use App\Models\MealOrderRequest;
use App\Models\QuotaPlan;
use App\Models\QuotaUsage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_employees' => Employee::count(),
            'active_plans' => QuotaPlan::where('is_active', true)->count(),
            'today_usages' => QuotaUsage::whereDate('used_at', today())->count(),
            'low_quota_alerts' => EmployeeQuota::where('remaining_qty', '<=', 1)
                ->where('status', 'active')->count(),
            'total_items' => Item::where('is_active', true)->count(),
            'month_usages' => QuotaUsage::whereMonth('used_at', now()->month)
                ->whereYear('used_at', now()->year)->count(),
            'pending_meal_orders' => MealOrderRequest::where('status', 'pending')->count(),
            'active_banners' => Banner::where('is_active', true)->count(),
        ];

        $recentUsages = QuotaUsage::with(['employee.user', 'item'])
            ->orderByDesc('used_at')
            ->take(10)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'employee_name' => $u->employee->user->name,
                'employee_avatar' => $u->employee->user->avatar,
                'item_name' => $u->item->name,
                'item_category' => $u->item->category,
                'quantity_used' => $u->quantity_used,
                'used_at' => $u->used_at->diffForHumans(),
                'used_at_full' => $u->used_at->format('M d, Y h:i A'),
            ]);

        $lowQuotaEmployees = EmployeeQuota::with(['employee.user', 'item'])
            ->where('remaining_qty', '<=', 2)
            ->where('status', 'active')
            ->orderBy('remaining_qty')
            ->take(5)
            ->get()
            ->map(fn ($eq) => [
                'employee_name' => $eq->employee->user->name,
                'employee_avatar' => $eq->employee->user->avatar,
                'item_name' => $eq->item->name,
                'remaining_qty' => $eq->remaining_qty,
                'total_qty' => $eq->total_qty,
            ]);

        $activePlans = QuotaPlan::where('is_active', true)
            ->orderByDesc('created_at')
            ->take(4)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'period_type' => $p->period_type,
                'ends_at' => $p->ends_at?->format('M d, Y'),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recent_usages' => $recentUsages,
            'low_quota_employees' => $lowQuotaEmployees,
            'active_plans' => $activePlans,
            'admin_name' => Auth::user()->name,
            'meal_orders_url' => route('admin.meal-orders.index'),
            'banners_url' => route('admin.banners.index'),
        ]);
    }
}
