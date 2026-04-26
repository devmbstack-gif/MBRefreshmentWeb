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
