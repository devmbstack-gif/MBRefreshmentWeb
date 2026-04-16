<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Item;
use App\Models\QuotaPlan;
use App\Models\QuotaPlanItem;
use App\Services\QuotaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QuotaPlanController extends Controller
{
    public function index(): Response
    {
        $plans = QuotaPlan::with(['planItems.item', 'creator'])
            ->latest()
            ->get()
            ->map(fn ($plan) => [
                'id' => $plan->id,
                'title' => $plan->title,
                'description' => $plan->description,
                'period_type' => $plan->period_type,
                'starts_at' => $plan->starts_at->format('Y-m-d'),
                'ends_at' => $plan->ends_at->format('Y-m-d'),
                'is_active' => $plan->is_active,
                'created_by_name' => $plan->creator->name,
                'items' => $plan->planItems->map(fn ($pi) => [
                    'item_id' => $pi->item_id,
                    'item_name' => $pi->item->name,
                    'quantity' => $pi->quantity,
                ]),
                'assigned_count' => $plan->employeeQuotas()->distinct('employee_id')->count(),
            ]);

        $availableItems = Item::where('is_active', true)->get(['id', 'name', 'category']);
        $employees = Employee::with('user')->get()->map(fn ($emp) => [
            'id' => $emp->id,
            'name' => $emp->user->name,
            'employee_code' => $emp->employee_code,
            'department' => $emp->department,
        ]);

        return Inertia::render('admin/plans', [
            'plans' => $plans,
            'available_items' => $availableItems,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'period_type' => 'required|in:monthly,weekly,custom',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request) {
            $plan = QuotaPlan::create([
                'title' => $request->title,
                'description' => $request->description,
                'period_type' => $request->period_type,
                'starts_at' => $request->starts_at,
                'ends_at' => $request->ends_at,
                'is_active' => true,
                'created_by' => auth()->id(),
            ]);

            foreach ($request->items as $itemData) {
                QuotaPlanItem::create([
                    'plan_id' => $plan->id,
                    'item_id' => $itemData['item_id'],
                    'quantity' => $itemData['quantity'],
                ]);
            }
        });

        return redirect()->route('admin.plans.index')->with('success', 'Quota plan created successfully.');
    }

    public function assign(Request $request, QuotaPlan $plan): RedirectResponse
    {
        $request->validate([
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'exists:employees,id',
        ]);

        app(QuotaService::class)->assignPlanToEmployees($plan, $request->employee_ids);

        $count = count($request->employee_ids);

        return redirect()->route('admin.plans.index')->with('success', "Plan assigned to {$count} employee(s) successfully.");
    }

    public function toggleStatus(QuotaPlan $plan): RedirectResponse
    {
        $plan->update(['is_active' => ! $plan->is_active]);

        $status = $plan->is_active ? 'activated' : 'deactivated';

        return redirect()->route('admin.plans.index')->with('success', "Plan {$status} successfully.");
    }
}
