<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\Employee;
use App\Models\EmployeeQuota;
use App\Models\QuotaPlan;
use App\Models\User;
use App\Services\Firebase\FcmService;

class NotificationService
{
    public function __construct(
        private FcmService $fcmService,
    ) {}

    public function notifyQuotaAssigned(Employee $employee, QuotaPlan $plan): void
    {
        $employee->loadMissing('user');
        $targetUser = $employee->user;
        if (! $targetUser) {
            return;
        }

        $this->saveInApp(
            user: $targetUser,
            type: 'quota_assigned',
            title: 'Quota Assigned',
            message: "You have been assigned the plan: {$plan->title}. Start using your refreshments!",
            relatedId: $plan->id
        );
    }

    public function notifyQuotaLow(Employee $employee, EmployeeQuota $quota): void
    {
        $quota->load('item');
        $employee->loadMissing('user');
        $targetUser = $employee->user;
        if (! $targetUser) {
            return;
        }

        $this->saveInApp(
            user: $targetUser,
            type: 'quota_low',
            title: 'Quota Running Low',
            message: "Only 1 {$quota->item->name} left in your quota. Use it before the plan expires!",
            relatedId: $quota->id
        );
    }

    public function notifyQuotaUsed(Employee $employee, EmployeeQuota $quota, int $quantity): void
    {
        $quota->load('item');
        $employee->loadMissing('user');
        $targetUser = $employee->user;
        if (! $targetUser) {
            return;
        }

        $this->saveInApp(
            user: $targetUser,
            type: 'quota_used',
            title: 'Quota Used',
            message: "You used {$quantity} {$quota->item->name}. Remaining: {$quota->remaining_qty}.",
            relatedId: $quota->id
        );
    }

    public function notifyQuotaExhausted(Employee $employee, EmployeeQuota $quota): void
    {
        $quota->load('item');
        $employee->loadMissing('user');
        $targetUser = $employee->user;
        if (! $targetUser) {
            return;
        }

        $this->saveInApp(
            user: $targetUser,
            type: 'quota_exhausted',
            title: 'Quota Exhausted',
            message: "Your {$quota->item->name} quota is fully used. No more remaining.",
            relatedId: $quota->id
        );
    }

    public function notifyQuotaExpired(Employee $employee, EmployeeQuota $quota): void
    {
        $quota->load('item', 'plan');
        $employee->loadMissing('user');
        $targetUser = $employee->user;
        if (! $targetUser) {
            return;
        }

        $this->saveInApp(
            user: $targetUser,
            type: 'quota_expired',
            title: 'Quota Expired',
            message: "Your quota for {$quota->item->name} from plan '{$quota->plan->title}' has expired.",
            relatedId: $quota->id
        );
    }

    public function saveInApp(User $user, string $type, string $title, string $message, ?int $relatedId = null): void
    {
        $allowedTypes = ['quota_assigned', 'quota_used', 'quota_low', 'quota_exhausted', 'quota_expired', 'general'];
        $safeType = in_array($type, $allowedTypes, true) ? $type : 'general';

        AppNotification::create([
            'user_id' => $user->id,
            'type' => $safeType,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
            'related_id' => $relatedId,
            'created_at' => now(),
        ]);

        $user->refresh();

        if ($user->fcm_token !== null && $user->fcm_token !== '') {
            $this->fcmService->sendToUser($user, $title, $message, [
                'type' => $safeType,
                'related_id' => $relatedId !== null ? (string) $relatedId : '',
            ]);
        }
    }
}
