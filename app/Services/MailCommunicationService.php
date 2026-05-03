<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeQuota;
use App\Models\MailMessage;
use App\Models\MealOrderRequest;
use App\Models\QuotaPlan;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\View;
use Throwable;

class MailCommunicationService
{
    public function __construct(
        private NotificationService $notificationService,
    ) {}

    private function resolveEmployeeToEmail(Employee $employee): ?string
    {
        $employee->loadMissing('user');
        $personal = trim((string) ($employee->personal_email ?? ''));
        if ($personal !== '' && filter_var($personal, FILTER_VALIDATE_EMAIL)) {
            return $personal;
        }

        $work = trim((string) ($employee->user?->email ?? ''));
        if ($work !== '' && filter_var($work, FILTER_VALIDATE_EMAIL)) {
            return $work;
        }

        return null;
    }

    public function notifyEmployeePlanAssigned(Employee $employee, QuotaPlan $plan): void
    {
        $employee->loadMissing('user');
        $user = $employee->user;
        if (! $user) {
            return;
        }

        $this->notificationService->notifyQuotaAssigned($employee, $plan);

        $toEmail = $this->resolveEmployeeToEmail($employee);
        if (! $toEmail) {
            return;
        }

        $fromAddress = (string) config('mail.from.address');
        if ($fromAddress === '') {
            return;
        }

        $fromName = (string) (Auth::user()?->name ?? config('mail.from.name') ?? config('app.name'));

        $subject = "You've been assigned: {$plan->title}";
        $planEndsAt = $plan->ends_at->format('F j, Y');
        $plainBody = "Hello {$user->name},\n\nYou have been added to the month plan: {$plan->title}.\nThe plan is active until {$planEndsAt}.\n\nSign in to MB Refreshment to view your quota and use your items.";

        $html = View::make('emails.plan-assigned', [
            'emailTitle' => $subject,
            'headerLine' => 'You have a new month plan',
            'recipientName' => $user->name,
            'planTitle' => $plan->title,
            'planEndsAt' => $planEndsAt,
            'ctaUrl' => url('/employee/quota'),
        ])->render();

        $this->dispatchMail(
            kind: 'plan_assigned',
            direction: 'to_employee',
            subject: $subject,
            body: $plainBody,
            html: $html,
            fromEmail: $fromAddress,
            fromName: $fromName,
            toEmail: $toEmail,
            employeeId: $employee->id,
        );
    }

    public function notifyAdminEmployeeUsedItem(EmployeeQuota $quota, int $quantity): void
    {
        $quota->loadMissing('employee.user', 'item', 'plan');
        $toAddress = (string) config('mail.from.address');
        if ($toAddress === '') {
            return;
        }

        $fromAddress = (string) config('mail.from.address');
        $fromName = (string) (config('mail.from.name') ?? config('app.name'));

        $employee = $quota->employee;
        if (! $employee) {
            return;
        }

        $user = $employee->user;
        if (! $user) {
            return;
        }

        $item = $quota->item;
        $plan = $quota->plan;
        if (! $item || ! $plan) {
            return;
        }

        $itemName = $item->name;
        $planTitle = $plan->title;

        $subject = "{$user->name} ordered {$quantity} × {$itemName}";
        $plainBody = "{$user->name} ({$employee->employee_code}) used {$quantity} of {$itemName} from plan \"{$planTitle}\". Remaining on this line: {$quota->remaining_qty}.";

        $html = View::make('emails.item-used-admin', [
            'emailTitle' => $subject,
            'headerLine' => 'Employee activity',
            'employeeName' => $user->name,
            'employeeCode' => $employee->employee_code,
            'itemName' => $itemName,
            'planTitle' => $planTitle,
            'quantity' => $quantity,
            'remainingQty' => $quota->remaining_qty,
            'ctaUrl' => url('/admin/dashboard'),
        ])->render();

        User::query()
            ->where('role', 'super_admin')
            ->where('is_active', true)
            ->each(function (User $admin) use ($subject, $plainBody, $quota) {
                $this->notificationService->saveInApp(
                    $admin,
                    'general',
                    $subject,
                    $plainBody,
                    $quota->id
                );
            });

        $this->dispatchMail(
            kind: 'item_ordered',
            direction: 'to_admin',
            subject: $subject,
            body: $plainBody,
            html: $html,
            fromEmail: $fromAddress,
            fromName: $fromName,
            toEmail: $toAddress,
            employeeId: $employee->id,
        );
    }

    public function notifyAdminsMealOrderPending(MealOrderRequest $mealRequest): void
    {
        $mealRequest->loadMissing(['employee.user', 'item', 'quota.plan']);
        $employee = $mealRequest->employee;
        $user = $employee?->user;
        $item = $mealRequest->item;
        $plan = $mealRequest->quota?->plan;
        if (! $employee || ! $user || ! $item || ! $plan) {
            return;
        }

        $subject = "Meal request: {$user->name} · {$item->name} × {$mealRequest->quantity}";
        $plainBody = "{$user->name} ({$employee->employee_code}) requested {$mealRequest->quantity} × {$item->name} from plan \"{$plan->title}\". Approve or reject in Meal Orders.";

        User::query()
            ->where('role', 'super_admin')
            ->where('is_active', true)
            ->each(function (User $admin) use ($plainBody, $mealRequest) {
                $this->notificationService->saveInApp(
                    $admin,
                    'general',
                    'Meal order pending approval',
                    $plainBody,
                    $mealRequest->id
                );
            });

        $toAddress = (string) config('mail.from.address');
        if ($toAddress === '') {
            return;
        }

        $fromAddress = (string) config('mail.from.address');
        $fromName = (string) (config('mail.from.name') ?? config('app.name'));

        $html = View::make('emails.meal-order-pending-admin', [
            'emailTitle' => $subject,
            'headerLine' => 'Meal order needs action',
            'employeeName' => $user->name,
            'employeeCode' => $employee->employee_code,
            'itemName' => $item->name,
            'planTitle' => $plan->title,
            'quantity' => $mealRequest->quantity,
            'ctaUrl' => url('/admin/meal-orders'),
        ])->render();

        $this->dispatchMail(
            kind: 'meal_order_pending_admin',
            direction: 'to_admin',
            subject: $subject,
            body: $plainBody,
            html: $html,
            fromEmail: $fromAddress,
            fromName: $fromName,
            toEmail: $toAddress,
            employeeId: $employee->id,
        );
    }

    public function notifyEmployeeMealRequestSubmitted(MealOrderRequest $mealRequest): void
    {
        $mealRequest->loadMissing(['employee.user', 'item']);
        $employee = $mealRequest->employee;
        $user = $employee?->user;
        $item = $mealRequest->item;
        if (! $user || ! $item || ! $employee) {
            return;
        }

        $plainBody = "Your request for {$mealRequest->quantity} × {$item->name} was received and is waiting for administrator approval.";

        $this->notificationService->saveInApp(
            $user,
            'general',
            'Meal request submitted',
            $plainBody,
            $mealRequest->id
        );

        $toEmail = $this->resolveEmployeeToEmail($employee);
        if (! $toEmail) {
            return;
        }

        $fromAddress = (string) config('mail.from.address');
        if ($fromAddress === '') {
            return;
        }

        $fromName = (string) (config('mail.from.name') ?? config('app.name'));
        $subject = "Received: meal request for {$item->name}";
        $html = View::make('emails.meal-order-submitted-employee', [
            'emailTitle' => $subject,
            'headerLine' => 'We received your meal request',
            'recipientName' => $user->name,
            'eventBody' => $plainBody,
            'itemName' => $item->name,
            'quantity' => $mealRequest->quantity,
            'ctaUrl' => url('/employee/quota'),
        ])->render();

        $this->dispatchMail(
            kind: 'meal_order_submitted_employee',
            direction: 'to_employee',
            subject: $subject,
            body: $plainBody,
            html: $html,
            fromEmail: $fromAddress,
            fromName: $fromName,
            toEmail: $toEmail,
            employeeId: $employee->id,
        );
    }

    public function notifyEmployeeMealOrderRejected(MealOrderRequest $mealRequest, ?string $reason): void
    {
        $mealRequest->loadMissing(['employee.user', 'item']);
        $employee = $mealRequest->employee;
        $user = $employee?->user;
        $item = $mealRequest->item;
        if (! $user || ! $item || ! $employee) {
            return;
        }

        $plainBody = "Your meal request for {$mealRequest->quantity} × {$item->name} was not approved. Nothing was deducted from your quota.";
        if ($reason !== null && $reason !== '') {
            $plainBody .= "\n\nNote: {$reason}";
        }

        $this->notificationService->saveInApp(
            $user,
            'general',
            'Meal request not approved',
            $plainBody,
            $mealRequest->id
        );

        $toEmail = $this->resolveEmployeeToEmail($employee);
        if (! $toEmail) {
            return;
        }

        $fromAddress = (string) config('mail.from.address');
        if ($fromAddress === '') {
            return;
        }

        $fromName = (string) (config('mail.from.name') ?? config('app.name'));
        $subject = "Meal request update: {$item->name}";
        $html = View::make('emails.meal-order-rejected-employee', [
            'emailTitle' => $subject,
            'headerLine' => 'Meal request was not approved',
            'recipientName' => $user->name,
            'itemName' => $item->name,
            'quantity' => $mealRequest->quantity,
            'reason' => $reason ?? '',
            'ctaUrl' => url('/employee/quota'),
        ])->render();

        $this->dispatchMail(
            kind: 'meal_order_rejected_employee',
            direction: 'to_employee',
            subject: $subject,
            body: $plainBody,
            html: $html,
            fromEmail: $fromAddress,
            fromName: $fromName,
            toEmail: $toEmail,
            employeeId: $employee->id,
        );
    }

    public function notifyEmployeePlanStatus(Employee $employee, QuotaPlan $plan, string $action): void
    {
        $employee->loadMissing('user');
        $user = $employee->user;
        if (! $user) {
            return;
        }

        $title = $action === 'deleted' ? 'Quota Plan Deleted' : 'Quota Plan Deactivated';
        $subject = $action === 'deleted'
            ? "Plan removed: {$plan->title}"
            : "Plan disabled: {$plan->title}";
        $plainBody = $action === 'deleted'
            ? "Your assigned plan \"{$plan->title}\" was deleted by admin. Please contact admin if you need a replacement quota."
            : "Your assigned plan \"{$plan->title}\" was deactivated by admin. You can no longer use its quota items.";
        $introText = $action === 'deleted'
            ? 'An administrator removed one of your assigned refreshment plans.'
            : 'An administrator deactivated one of your assigned refreshment plans.';
        $detailText = $action === 'deleted'
            ? 'This plan was deleted and is no longer available in your quota list.'
            : 'This plan is currently disabled, so its quota items are unavailable for use.';

        $this->notificationService->saveInApp(
            $user,
            'general',
            $title,
            $plainBody,
            $plan->id
        );

        $toEmail = $this->resolveEmployeeToEmail($employee);
        if (! $toEmail) {
            return;
        }

        $fromAddress = (string) config('mail.from.address');
        if ($fromAddress === '') {
            return;
        }

        $fromName = (string) (Auth::user()?->name ?? config('mail.from.name') ?? config('app.name'));
        $html = View::make('emails.plan-status-employee', [
            'emailTitle' => $subject,
            'headerLine' => $action === 'deleted' ? 'Your plan was removed' : 'Your plan was deactivated',
            'recipientName' => $user->name,
            'planTitle' => $plan->title,
            'introText' => $introText,
            'detailText' => $detailText,
            'ctaUrl' => url('/employee/quota'),
        ])->render();

        $this->dispatchMail(
            kind: $action === 'deleted' ? 'plan_deleted' : 'plan_deactivated',
            direction: 'to_employee',
            subject: $subject,
            body: $plainBody,
            html: $html,
            fromEmail: $fromAddress,
            fromName: $fromName,
            toEmail: $toEmail,
            employeeId: $employee->id,
        );
    }

    public function notifyEmployeeQuotaUsed(EmployeeQuota $quota, int $quantity): void
    {
        $quota->loadMissing('employee.user', 'item', 'plan');
        $employee = $quota->employee;
        $user = $employee?->user;
        $item = $quota->item;
        $plan = $quota->plan;
        if (! $employee || ! $user || ! $item || ! $plan) {
            return;
        }

        $toEmail = $this->resolveEmployeeToEmail($employee);
        if (! $toEmail) {
            return;
        }

        $fromAddress = (string) config('mail.from.address');
        if ($fromAddress === '') {
            return;
        }

        $fromName = (string) (config('mail.from.name') ?? config('app.name'));
        $subject = "Quota used: {$item->name}";
        $plainBody = "You used {$quantity} of {$item->name} from plan \"{$plan->title}\". Remaining on this quota line: {$quota->remaining_qty}.";
        $html = View::make('emails.quota-event-employee', [
            'emailTitle' => $subject,
            'headerLine' => 'Quota activity update',
            'recipientName' => $user->name,
            'eventTitle' => 'Quota used',
            'eventBody' => $plainBody,
            'ctaUrl' => url('/employee/quota'),
        ])->render();

        $this->dispatchMail(
            kind: 'quota_used',
            direction: 'to_employee',
            subject: $subject,
            body: $plainBody,
            html: $html,
            fromEmail: $fromAddress,
            fromName: $fromName,
            toEmail: $toEmail,
            employeeId: $employee->id,
        );
    }

    public function notifyEmployeeQuotaThreshold(EmployeeQuota $quota, string $event): void
    {
        $quota->loadMissing('employee.user', 'item', 'plan');
        $employee = $quota->employee;
        $user = $employee?->user;
        $item = $quota->item;
        $plan = $quota->plan;
        if (! $employee || ! $user || ! $item || ! $plan) {
            return;
        }

        $toEmail = $this->resolveEmployeeToEmail($employee);
        if (! $toEmail) {
            return;
        }

        $fromAddress = (string) config('mail.from.address');
        if ($fromAddress === '') {
            return;
        }

        $fromName = (string) (config('mail.from.name') ?? config('app.name'));

        if ($event === 'low') {
            $subject = "Quota running low: {$item->name}";
            $eventTitle = 'Quota running low';
            $plainBody = "Only {$quota->remaining_qty} {$item->name} left in your quota from plan \"{$plan->title}\".";
        } elseif ($event === 'exhausted') {
            $subject = "Quota exhausted: {$item->name}";
            $eventTitle = 'Quota exhausted';
            $plainBody = "Your {$item->name} quota from plan \"{$plan->title}\" is fully used.";
        } else {
            $subject = "Quota expired: {$item->name}";
            $eventTitle = 'Quota expired';
            $plainBody = "Your {$item->name} quota from plan \"{$plan->title}\" has expired.";
        }

        $html = View::make('emails.quota-event-employee', [
            'emailTitle' => $subject,
            'headerLine' => 'Quota activity update',
            'recipientName' => $user->name,
            'eventTitle' => $eventTitle,
            'eventBody' => $plainBody,
            'ctaUrl' => url('/employee/quota'),
        ])->render();

        $this->dispatchMail(
            kind: "quota_{$event}",
            direction: 'to_employee',
            subject: $subject,
            body: $plainBody,
            html: $html,
            fromEmail: $fromAddress,
            fromName: $fromName,
            toEmail: $toEmail,
            employeeId: $employee->id,
        );
    }

    private function dispatchMail(
        string $kind,
        string $direction,
        string $subject,
        string $body,
        string $html,
        string $fromEmail,
        string $fromName,
        string $toEmail,
        ?int $employeeId,
    ): bool {
        try {
            Mail::html($html, function ($message) use ($toEmail, $subject, $fromEmail, $fromName) {
                $message->from($fromEmail, $fromName)
                    ->to($toEmail)
                    ->subject($subject);
            });

            MailMessage::create([
                'kind' => $kind,
                'direction' => $direction,
                'subject' => $subject,
                'body' => $body,
                'from_email' => $fromEmail,
                'to_email' => $toEmail,
                'employee_id' => $employeeId,
                'status' => 'sent',
            ]);

            return true;
        } catch (Throwable $e) {
            report($e);

            MailMessage::create([
                'kind' => $kind,
                'direction' => $direction,
                'subject' => $subject,
                'body' => $body,
                'from_email' => $fromEmail,
                'to_email' => $toEmail,
                'employee_id' => $employeeId,
                'status' => 'failed',
                'failed_reason' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
