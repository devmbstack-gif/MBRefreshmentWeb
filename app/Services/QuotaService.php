<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeQuota;
use App\Models\MealOrderRequest;
use App\Models\QuotaPlan;
use App\Models\QuotaUsage;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class QuotaService
{
    public function __construct(
        private NotificationService $notificationService,
        private MailCommunicationService $mailCommunicationService,
    ) {}

    public function assignPlanToEmployees(QuotaPlan $plan, array $employeeIds, array $allocations = []): void
    {
        $plan->load('planItems');
        $employeeIds = array_values(array_unique(array_map('intval', $employeeIds)));
        if (count($employeeIds) === 0) {
            return;
        }

        $employees = Employee::query()->whereIn('id', $employeeIds)->get()->keyBy('id');

        foreach ($employeeIds as $employeeId) {
            $employee = $employees->get($employeeId);
            if (! $employee) {
                continue;
            }
            foreach ($plan->planItems as $planItem) {
                $allocatedQty = max(0, (int) ($allocations[$employeeId][$planItem->item_id] ?? 0));

                EmployeeQuota::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'plan_id' => $plan->id,
                        'item_id' => $planItem->item_id,
                    ],
                    [
                        'total_qty' => $allocatedQty,
                        'used_qty' => 0,
                        'remaining_qty' => $allocatedQty,
                        'status' => $allocatedQty > 0 ? 'active' : 'exhausted',
                    ]
                );
            }

            $this->mailCommunicationService->notifyEmployeePlanAssigned($employee, $plan);
        }
    }

    public function useQuota(EmployeeQuota $quota, int $quantity = 1): void
    {
        $quota->loadMissing('item');
        if ($quota->status !== 'active') {
            throw new \Exception("This quota is {$quota->status} and cannot be used.");
        }

        if ($quota->remaining_qty < $quantity) {
            throw new \Exception("Not enough quota left. You only have {$quota->remaining_qty} remaining.");
        }
        if (! $quota->item || ! $quota->item->is_active) {
            throw new \Exception('This item is inactive and cannot be consumed.');
        }
        if ($quota->item->stock_quantity < $quantity) {
            throw new \Exception("Not enough stock for {$quota->item->name}. Available stock: {$quota->item->stock_quantity}.");
        }

        $triggerLow = false;
        $triggerExhausted = false;

        DB::transaction(function () use ($quota, $quantity, &$triggerLow, &$triggerExhausted) {
            $quota->increment('used_qty', $quantity);
            $quota->decrement('remaining_qty', $quantity);
            $quota->item->decrement('stock_quantity', $quantity);

            QuotaUsage::create([
                'employee_id' => $quota->employee_id,
                'employee_quota_id' => $quota->id,
                'item_id' => $quota->item_id,
                'quantity_used' => $quantity,
                'used_at' => now(),
                'created_at' => now(),
            ]);

            $quota->refresh();

            if ($quota->remaining_qty === 0) {
                $quota->update(['status' => 'exhausted']);
                $this->notificationService->notifyQuotaExhausted($quota->employee, $quota);
                $triggerExhausted = true;
            } elseif ($quota->remaining_qty === 1) {
                $this->notificationService->notifyQuotaLow($quota->employee, $quota);
                $triggerLow = true;
            }
        });

        $quota->refresh();

        if (! $triggerExhausted && ! $triggerLow) {
            $this->notificationService->notifyQuotaUsed($quota->employee, $quota, $quantity);
        }

        if ($triggerExhausted) {
            $this->mailCommunicationService->notifyEmployeeQuotaThreshold($quota, 'exhausted');
        } elseif ($triggerLow) {
            $this->mailCommunicationService->notifyEmployeeQuotaThreshold($quota, 'low');
        } else {
            $this->mailCommunicationService->notifyEmployeeQuotaUsed($quota, $quantity);
        }

        $this->mailCommunicationService->notifyAdminEmployeeUsedItem($quota, $quantity);
    }

    public function requestMealQuota(EmployeeQuota $quota, int $quantity = 1): MealOrderRequest
    {
        $quota->loadMissing('item');
        if ($quota->status !== 'active') {
            throw new \Exception("This quota is {$quota->status} and cannot be used.");
        }
        if ($quota->remaining_qty < $quantity) {
            throw new \Exception("Not enough quota left. You only have {$quota->remaining_qty} remaining.");
        }
        if (! $quota->item || ! $quota->item->is_active) {
            throw new \Exception('This item is inactive and cannot be requested.');
        }

        $mealRequest = MealOrderRequest::create([
            'employee_id' => $quota->employee_id,
            'employee_quota_id' => $quota->id,
            'item_id' => $quota->item_id,
            'quantity' => $quantity,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $mealRequest->load(['employee.user', 'item', 'quota.plan']);
        $this->mailCommunicationService->notifyAdminsMealOrderPending($mealRequest);
        $this->mailCommunicationService->notifyEmployeeMealRequestSubmitted($mealRequest);

        return $mealRequest;
    }

    public function approveMealOrderRequest(MealOrderRequest $request, User $admin): void
    {
        if ($request->status !== 'pending') {
            throw new \Exception('This meal request has already been processed.');
        }

        $request->loadMissing(['quota.item', 'quota.employee']);
        $quota = $request->quota;

        if (! $quota) {
            throw new \Exception('Related quota was not found.');
        }
        if ($quota->status !== 'active') {
            throw new \Exception("This quota is {$quota->status} and cannot be approved.");
        }
        if (! $quota->item || ! $quota->item->is_active) {
            throw new \Exception('This item is inactive and cannot be approved.');
        }
        if ($quota->remaining_qty < $request->quantity) {
            throw new \Exception("Not enough quota left. Employee has {$quota->remaining_qty} remaining.");
        }
        if ($quota->item->stock_quantity < $request->quantity) {
            throw new \Exception("Not enough stock for {$quota->item->name}. Available stock: {$quota->item->stock_quantity}.");
        }

        $triggerLow = false;
        $triggerExhausted = false;

        DB::transaction(function () use ($request, $admin, $quota, &$triggerLow, &$triggerExhausted) {
            $quota->increment('used_qty', $request->quantity);
            $quota->decrement('remaining_qty', $request->quantity);
            $quota->item->decrement('stock_quantity', $request->quantity);

            QuotaUsage::create([
                'employee_id' => $quota->employee_id,
                'employee_quota_id' => $quota->id,
                'item_id' => $quota->item_id,
                'quantity_used' => $request->quantity,
                'used_at' => now(),
                'note' => 'meal_request:'.$request->id,
                'created_at' => now(),
            ]);

            $quota->refresh();
            if ($quota->remaining_qty === 0) {
                $quota->update(['status' => 'exhausted']);
                $this->notificationService->notifyQuotaExhausted($quota->employee, $quota);
                $triggerExhausted = true;
            } elseif ($quota->remaining_qty === 1) {
                $this->notificationService->notifyQuotaLow($quota->employee, $quota);
                $triggerLow = true;
            }

            $request->update([
                'status' => 'approved',
                'processed_at' => now(),
                'processed_by_user_id' => $admin->id,
            ]);
        });

        $quota->refresh();

        if (! $triggerExhausted && ! $triggerLow) {
            $this->notificationService->notifyQuotaUsed($quota->employee, $quota, $request->quantity);
        }

        if ($triggerExhausted) {
            $this->mailCommunicationService->notifyEmployeeQuotaThreshold($quota, 'exhausted');
        } elseif ($triggerLow) {
            $this->mailCommunicationService->notifyEmployeeQuotaThreshold($quota, 'low');
        } else {
            $this->mailCommunicationService->notifyEmployeeQuotaUsed($quota, $request->quantity);
        }
    }

    public function rejectMealOrderRequest(MealOrderRequest $request, User $admin, ?string $reason = null): void
    {
        if ($request->status !== 'pending') {
            throw new \Exception('This meal request has already been processed.');
        }

        $request->loadMissing(['employee.user', 'item']);

        $request->update([
            'status' => 'rejected',
            'processed_at' => now(),
            'processed_by_user_id' => $admin->id,
            'rejection_reason' => $reason,
        ]);

        $this->mailCommunicationService->notifyEmployeeMealOrderRejected($request, $reason);
    }

    public function expireOldQuotas(): void
    {
        $expiredQuotas = EmployeeQuota::where('status', 'active')
            ->whereHas('plan', fn ($query) => $query->where('ends_at', '<', today()))
            ->with('employee')
            ->get();

        foreach ($expiredQuotas as $quota) {
            $quota->update(['status' => 'expired']);
            $this->notificationService->notifyQuotaExpired($quota->employee, $quota);
            $this->mailCommunicationService->notifyEmployeeQuotaThreshold($quota, 'expired');
        }
    }
}
