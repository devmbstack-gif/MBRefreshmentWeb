<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\Employee;
use App\Models\EmployeeQuota;
use App\Models\QuotaPlan;
use App\Models\User;

class NotificationService
{
    public function notifyQuotaAssigned(Employee $employee, QuotaPlan $plan): void
    {
        $this->saveInApp(
            user: $employee->user,
            type: 'quota_assigned',
            title: 'Quota Assigned',
            message: "You have been assigned the plan: {$plan->title}. Start using your refreshments!",
            relatedId: $plan->id
        );
    }

    public function notifyQuotaLow(Employee $employee, EmployeeQuota $quota): void
    {
        $quota->load('item');

        $this->saveInApp(
            user: $employee->user,
            type: 'quota_low',
            title: 'Quota Running Low',
            message: "Only 1 {$quota->item->name} left in your quota. Use it before the plan expires!",
            relatedId: $quota->id
        );
    }

    public function notifyQuotaExhausted(Employee $employee, EmployeeQuota $quota): void
    {
        $quota->load('item');

        $this->saveInApp(
            user: $employee->user,
            type: 'quota_exhausted',
            title: 'Quota Exhausted',
            message: "Your {$quota->item->name} quota is fully used. No more remaining.",
            relatedId: $quota->id
        );
    }

    public function notifyQuotaExpired(Employee $employee, EmployeeQuota $quota): void
    {
        $quota->load('item', 'plan');

        $this->saveInApp(
            user: $employee->user,
            type: 'quota_expired',
            title: 'Quota Expired',
            message: "Your quota for {$quota->item->name} from plan '{$quota->plan->title}' has expired.",
            relatedId: $quota->id
        );
    }

    public function saveInApp(User $user, string $type, string $title, string $message, ?int $relatedId = null): void
    {
        AppNotification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
            'related_id' => $relatedId,
            'created_at' => now(),
        ]);
    }
}
