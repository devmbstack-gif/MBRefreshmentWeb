<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\MailMessage;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;
use Inertia\Response;

class MailMessageController extends Controller
{
    private function buildAttachmentUrls(?array $attachments): array
    {
        if (! $attachments) {
            return [];
        }

        return collect($attachments)
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->map(fn ($path) => url($path))
            ->values()
            ->all();
    }

    public function index(): Response
    {
        $messages = MailMessage::query()
            ->with('employee.user:id,name')
            ->whereIn('kind', ['issue_report', 'feature_request'])
            ->latest('created_at')
            ->limit(120)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'kind' => $m->kind,
                'direction' => $m->direction,
                'subject' => $m->subject,
                'body' => $m->body,
                'from_email' => $m->from_email,
                'to_email' => $m->to_email,
                'status' => $m->status,
                'failed_reason' => $m->failed_reason,
                'created_at' => $m->created_at?->format('M d, Y h:i A'),
                'employee_name' => $m->employee?->user?->name,
                'employee_id' => $m->employee_id,
                'attachments' => $this->buildAttachmentUrls($m->attachments),
            ]);

        $replies = MailMessage::query()
            ->with('employee.user:id,name')
            ->where('kind', 'admin_reply')
            ->whereNotNull('reply_to_id')
            ->latest('created_at')
            ->limit(240)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'reply_to_id' => $m->reply_to_id,
                'subject' => $m->subject,
                'body' => $m->body,
                'created_at' => $m->created_at?->format('M d, Y h:i A'),
                'employee_id' => $m->employee_id,
                'employee_name' => $m->employee?->user?->name,
                'attachments' => $this->buildAttachmentUrls($m->attachments),
            ]);

        return Inertia::render('admin/feedback', ['messages' => $messages, 'replies' => $replies]);
    }

    public function reply(Request $request, MailMessage $message): RedirectResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        if (! in_array($message->kind, ['issue_report', 'feature_request'], true)) {
            return redirect()->route('admin.mail-messages.index')->with('error', 'Reply is only allowed on issue/feature requests.');
        }

        $employee = Employee::with('user')->find($message->employee_id);
        $employeeUser = $employee?->user;
        if (! $employee || ! $employeeUser) {
            return redirect()->route('admin.mail-messages.index')->with('error', 'Employee not found for this request.');
        }

        $subject = "Re: {$message->subject}";
        $fromAddress = (string) config('mail.from.address');
        $fromName = (string) ($request->user()?->name ?? config('mail.from.name') ?? config('app.name'));
        $toAddress = (string) $employeeUser->email;

        $replyRecord = MailMessage::create([
            'kind' => 'admin_reply',
            'direction' => 'to_employee',
            'subject' => $subject,
            'body' => $validated['body'],
            'from_email' => $fromAddress !== '' ? $fromAddress : (string) $request->user()?->email,
            'to_email' => $toAddress,
            'employee_id' => $employee->id,
            'reply_to_id' => $message->id,
            'status' => 'sent',
        ]);

        if ($fromAddress !== '' && $toAddress !== '') {
            $html = View::make('emails.admin-reply-employee', [
                'emailTitle' => $subject,
                'headerLine' => 'Admin replied to your request',
                'recipientName' => $employeeUser->name,
                'requestType' => $message->kind === 'feature_request' ? 'feature request' : 'issue report',
                'subjectLine' => $message->subject,
                'replyBody' => $validated['body'],
                'ctaUrl' => url('/employee/feedback'),
            ])->render();

            Mail::html($html, function ($mail) use ($toAddress, $subject, $fromAddress, $fromName) {
                $mail->from($fromAddress, $fromName)
                    ->to($toAddress)
                    ->subject($subject);
            });
        }

        app(NotificationService::class)->saveInApp(
            $employeeUser,
            'general',
            'Admin replied to your request',
            $validated['body'],
            $replyRecord->id
        );

        return redirect()->route('admin.mail-messages.index')->with('success', 'Reply sent to employee successfully.');
    }
}
