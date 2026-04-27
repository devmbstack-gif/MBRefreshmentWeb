<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Item;
use App\Models\QuotaPlan;
use App\Models\QuotaPlanItem;
use App\Services\MailCommunicationService;
use App\Services\QuotaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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
                'assigned_employee_ids' => $plan->employeeQuotas()->distinct('employee_id')->pluck('employee_id')->values(),
            ]);

        $availableItems = Item::where('is_active', true)->get(['id', 'name', 'category', 'stock_quantity']);
        $employees = Employee::with('user')->get()->map(fn ($emp) => [
            'id' => $emp->id,
            'name' => $emp->user->name,
            'avatar' => $emp->user->avatar,
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
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'period_type' => 'required|in:monthly,weekly,custom',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        foreach ($validated['items'] as $index => $itemData) {
            $item = Item::find($itemData['item_id']);
            if (! $item || ! $item->is_active) {
                throw ValidationException::withMessages([
                    "items.{$index}.item_id" => 'Only active items can be added to a month plan.',
                ]);
            }
            if ($itemData['quantity'] > $item->stock_quantity) {
                throw ValidationException::withMessages([
                    "items.{$index}.quantity" => "Quantity for {$item->name} cannot exceed stock ({$item->stock_quantity}).",
                ]);
            }
        }

        DB::transaction(function () use ($request) {
            $plan = QuotaPlan::create([
                'title' => $request->title,
                'description' => $request->description,
                'period_type' => $request->period_type,
                'starts_at' => $request->starts_at,
                'ends_at' => $request->ends_at,
                'is_active' => true,
                'created_by' => $request->user()->id,
            ]);

            foreach ($request->items as $itemData) {
                QuotaPlanItem::create([
                    'plan_id' => $plan->id,
                    'item_id' => $itemData['item_id'],
                    'quantity' => $itemData['quantity'],
                ]);
            }
        });

        return redirect()->route('admin.plans.index')->with('success', 'Month plan created successfully.');
    }

    public function update(Request $request, QuotaPlan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'period_type' => 'required|in:monthly,weekly,custom',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        foreach ($validated['items'] as $index => $itemData) {
            $item = Item::find($itemData['item_id']);
            if (! $item || ! $item->is_active) {
                throw ValidationException::withMessages([
                    "items.{$index}.item_id" => 'Only active items can be used in a month plan.',
                ]);
            }
            if ($itemData['quantity'] > $item->stock_quantity) {
                throw ValidationException::withMessages([
                    "items.{$index}.quantity" => "Quantity for {$item->name} cannot exceed stock ({$item->stock_quantity}).",
                ]);
            }
        }

        DB::transaction(function () use ($plan, $validated) {
            $plan->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'period_type' => $validated['period_type'],
                'starts_at' => $validated['starts_at'],
                'ends_at' => $validated['ends_at'],
            ]);

            DB::table('quota_plan_items')->where('plan_id', $plan->id)->delete();
            foreach ($validated['items'] as $itemData) {
                QuotaPlanItem::create([
                    'plan_id' => $plan->id,
                    'item_id' => $itemData['item_id'],
                    'quantity' => $itemData['quantity'],
                ]);
            }
        });

        return redirect()->route('admin.plans.index')->with('success', 'Month plan updated successfully.');
    }

    public function assign(Request $request, QuotaPlan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'exists:employees,id',
            'allocations' => 'required|array|min:1',
            'allocations.*.employee_id' => 'required|exists:employees,id',
            'allocations.*.item_id' => 'required|exists:items,id',
            'allocations.*.quantity' => 'required|integer|min:0',
        ]);

        $employeeIds = collect($validated['employee_ids'])->map(fn ($id) => (int) $id)->unique()->values()->all();

        $plan->load('planItems.item');
        $planItemsById = $plan->planItems->keyBy('item_id');
        $allocationMap = [];
        $allocationTotalsByItem = [];

        foreach ($plan->planItems as $planItem) {
            if (! $planItem->item || ! $planItem->item->is_active) {
                throw ValidationException::withMessages([
                    'employee_ids' => "Item {$planItem->item?->name} is inactive and cannot be assigned.",
                ]);
            }

            if ($planItem->quantity > $planItem->item->stock_quantity) {
                throw ValidationException::withMessages([
                    'employee_ids' => "Assigned quantity for {$planItem->item->name} exceeds stock ({$planItem->item->stock_quantity}).",
                ]);
            }
        }

        foreach ($validated['allocations'] as $row) {
            $empId = (int) $row['employee_id'];
            $itemId = (int) $row['item_id'];
            $qty = (int) $row['quantity'];

            if (! in_array($empId, $employeeIds, true)) {
                throw ValidationException::withMessages([
                    'allocations' => 'Allocation contains an employee that is not selected.',
                ]);
            }

            if (! $planItemsById->has($itemId)) {
                throw ValidationException::withMessages([
                    'allocations' => 'Allocation contains an item that is not in this plan.',
                ]);
            }

            $allocationMap[$empId][$itemId] = $qty;
            $allocationTotalsByItem[$itemId] = ($allocationTotalsByItem[$itemId] ?? 0) + $qty;
        }

        foreach ($plan->planItems as $planItem) {
            $assignedQty = (int) ($allocationTotalsByItem[$planItem->item_id] ?? 0);
            if ($assignedQty > (int) $planItem->quantity) {
                throw ValidationException::withMessages([
                    'allocations' => "Assigned quantity for {$planItem->item->name} cannot exceed plan quantity ({$planItem->quantity}).",
                ]);
            }
        }

        app(QuotaService::class)->assignPlanToEmployees($plan, $employeeIds, $allocationMap);

        $count = count($employeeIds);

        return redirect()->route('admin.plans.index')->with('success', "Month plan assigned to {$count} employee(s) successfully.");
    }

    public function toggleStatus(QuotaPlan $plan): RedirectResponse
    {
        $employeesToNotify = Employee::query()
            ->whereIn('id', DB::table('employee_quotas')->where('plan_id', $plan->id)->distinct()->pluck('employee_id'))
            ->get();

        $plan->update(['is_active' => ! $plan->is_active]);

        $status = $plan->is_active ? 'activated' : 'deactivated';

        if ($status === 'deactivated' && $employeesToNotify->isNotEmpty()) {
            $mailer = app(MailCommunicationService::class);
            foreach ($employeesToNotify as $employee) {
                $mailer->notifyEmployeePlanStatus($employee, $plan, 'deactivated');
            }
        }

        return redirect()->route('admin.plans.index')->with('success', "Plan {$status} successfully.");
    }

    public function destroy(QuotaPlan $plan): RedirectResponse
    {
        $employeesToNotify = Employee::query()
            ->whereIn('id', DB::table('employee_quotas')->where('plan_id', $plan->id)->distinct()->pluck('employee_id'))
            ->get();

        DB::transaction(function () use ($plan) {
            $employeeQuotaIds = DB::table('employee_quotas')
                ->where('plan_id', $plan->id)
                ->pluck('id');

            if ($employeeQuotaIds->isNotEmpty()) {
                DB::table('quota_usages')
                    ->whereIn('employee_quota_id', $employeeQuotaIds->all())
                    ->delete();
            }

            $plan->delete();
        });

        if ($employeesToNotify->isNotEmpty()) {
            $mailer = app(MailCommunicationService::class);
            foreach ($employeesToNotify as $employee) {
                $mailer->notifyEmployeePlanStatus($employee, $plan, 'deleted');
            }
        }

        return redirect()->route('admin.plans.index')->with('success', 'Plan deleted successfully.');
    }
}
