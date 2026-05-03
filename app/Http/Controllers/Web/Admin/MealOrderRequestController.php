<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\MealOrderRequest;
use App\Services\QuotaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MealOrderRequestController extends Controller
{
    public function index(): Response
    {
        $requests = MealOrderRequest::query()
            ->with(['employee.user', 'item', 'processedBy'])
            ->latest('requested_at')
            ->get()
            ->map(fn (MealOrderRequest $request) => [
                'id' => $request->id,
                'employee_name' => $request->employee?->user?->name,
                'item_name' => $request->item?->name,
                'item_category' => $request->item?->category,
                'quantity' => $request->quantity,
                'status' => $request->status,
                'requested_at' => $request->requested_at?->format('M d, Y h:i A'),
                'processed_at' => $request->processed_at?->format('M d, Y h:i A'),
                'processed_by' => $request->processedBy?->name,
                'rejection_reason' => $request->rejection_reason,
            ]);

        return Inertia::render('admin/meal-orders', [
            'requests' => $requests,
        ]);
    }

    public function approve(MealOrderRequest $request, QuotaService $quotaService): RedirectResponse
    {
        $admin = Auth::user();
        if (! $admin) {
            abort(403);
        }

        try {
            $quotaService->approveMealOrderRequest($request, $admin);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Meal request approved successfully.');
    }

    public function reject(Request $httpRequest, MealOrderRequest $request, QuotaService $quotaService): RedirectResponse
    {
        $admin = Auth::user();
        if (! $admin) {
            abort(403);
        }

        $validated = $httpRequest->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $quotaService->rejectMealOrderRequest($request, $admin, $validated['reason'] ?? null);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Meal request rejected successfully.');
    }
}
