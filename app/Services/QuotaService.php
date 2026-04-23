<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeQuota;
use App\Models\QuotaPlan;
use App\Models\QuotaUsage;
use Illuminate\Support\Facades\DB;

class QuotaService
{
    public function __construct(
        private NotificationService $notificationService,
        private MailCommunicationService $mailCommunicationService,
    ) {}

    public function assignPlanToEmployees(QuotaPlan $plan, array $employeeIds): void
    {
        $plan->load('planItems');

        foreach ($employeeIds as $employeeId) {
            $employee = Employee::findOrFail($employeeId);

            foreach ($plan->planItems as $planItem) {
                EmployeeQuota::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'plan_id' => $plan->id,
                        'item_id' => $planItem->item_id,
                    ],
                    [
                        'total_qty' => $planItem->quantity,
                        'used_qty' => 0,
                        'remaining_qty' => $planItem->quantity,
                        'status' => 'active',
                    ]
                );
            }

            $this->notificationService->notifyQuotaAssigned($employee, $plan);
            $this->mailCommunicationService->notifyEmployeePlanAssigned($employee, $plan);
        }
    }

    public function useQuota(EmployeeQuota $quota, int $quantity = 1): void
    {
        if ($quota->status !== 'active') {
            throw new \Exception("This quota is {$quota->status} and cannot be used.");
        }

        if ($quota->remaining_qty < $quantity) {
            throw new \Exception("Not enough quota left. You only have {$quota->remaining_qty} remaining.");
        }

        DB::transaction(function () use ($quota, $quantity) {
            $quota->increment('used_qty', $quantity);
            $quota->decrement('remaining_qty', $quantity);

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
            } elseif ($quota->remaining_qty === 1) {
                $this->notificationService->notifyQuotaLow($quota->employee, $quota);
            }
        });

        $quota->refresh();
        $this->mailCommunicationService->notifyAdminEmployeeUsedItem($quota, $quantity);
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
        }
    }
}
