<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeQuota;
use App\Models\MailMessage;
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

    public function notifyEmployeePlanAssigned(Employee $employee, QuotaPlan $plan): void
    {
        $employee->loadMissing('user');
        $user = $employee->user;
        if (! $user) {
            return;
        }

        $this->notificationService->notifyQuotaAssigned($employee, $plan);

        if (! $user->email) {
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
            toEmail: $user->email,
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

        $sent = $this->dispatchMail(
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

        if ($sent) {
            User::query()
                ->where('role', 'super_admin')
                ->where('is_active', true)
                ->each(function (User $admin) use ($subject, $plainBody, $quota) {
                    $this->notificationService->saveInApp(
                        $admin,
                        'admin_item_ordered',
                        $subject,
                        $plainBody,
                        $quota->id
                    );
                });
        }
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

        if (! $user->email) {
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
            toEmail: $user->email,
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
        if (! $employee || ! $user || ! $item || ! $plan || ! $user->email) {
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
            toEmail: $user->email,
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
        if (! $employee || ! $user || ! $item || ! $plan || ! $user->email) {
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
            toEmail: $user->email,
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
