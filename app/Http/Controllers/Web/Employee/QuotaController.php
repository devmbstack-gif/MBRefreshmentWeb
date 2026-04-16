<?php

namespace App\Http\Controllers\Web\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeQuota;
use App\Models\QuotaUsage;
use App\Services\QuotaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotaController extends Controller
{
    public function index(): Response
    {
        $employee = auth()->user()->employee;

        $quotas = EmployeeQuota::where('employee_id', $employee->id)
            ->whereIn('status', ['active', 'exhausted'])
            ->with(['item', 'plan'])
            ->get()
            ->map(fn ($quota) => [
                'id' => $quota->id,
                'item_name' => $quota->item->name,
                'item_category' => $quota->item->category,
                'plan_title' => $quota->plan->title,
                'plan_ends_at' => $quota->plan->ends_at->format('M d, Y'),
                'total_qty' => $quota->total_qty,
                'used_qty' => $quota->used_qty,
                'remaining_qty' => $quota->remaining_qty,
                'status' => $quota->status,
                'percentage_used' => $quota->total_qty > 0
                    ? round(($quota->used_qty / $quota->total_qty) * 100)
                    : 0,
            ]);

        return Inertia::render('employee/quota', [
            'quotas' => $quotas,
            'employee_name' => auth()->user()->name,
        ]);
    }

    public function use(Request $request, EmployeeQuota $quota): RedirectResponse
    {
        $employee = auth()->user()->employee;

        if ($quota->employee_id !== $employee->id) {
            abort(403, 'This quota does not belong to you.');
        }

        try {
            app(QuotaService::class)->useQuota($quota, 1);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Quota used successfully!');
    }

    public function history(): Response
    {
        $employee = auth()->user()->employee;

        $usages = QuotaUsage::where('employee_id', $employee->id)
            ->with('item')
            ->orderByDesc('used_at')
            ->get()
            ->map(fn ($usage) => [
                'id' => $usage->id,
                'item_name' => $usage->item->name,
                'item_category' => $usage->item->category,
                'quantity_used' => $usage->quantity_used,
                'used_at' => $usage->used_at->format('M d, Y h:i A'),
            ]);

        return Inertia::render('employee/history', [
            'usages' => $usages,
        ]);
    }
}
