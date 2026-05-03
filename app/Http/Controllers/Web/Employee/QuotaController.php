<?php

namespace App\Http\Controllers\Web\Employee;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\EmployeeQuota;
use App\Models\MailMessage;
use App\Models\QuotaUsage;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\QuotaService;
use App\Support\PublicDiskUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class QuotaController extends Controller
{
    public function index(): Response
    {
        $employee = Auth::user()?->employee;

        $quotas = EmployeeQuota::where('employee_id', $employee->id)
            ->whereIn('status', ['active', 'exhausted'])
            ->whereHas('plan', fn ($query) => $query->where('is_active', true))
            ->whereHas('item', fn ($query) => $query->where('is_active', true))
            ->with(['item', 'plan'])
            ->get()
            ->map(function ($quota) {
                $img = $quota->item->image_url;

                return [
                    'id' => $quota->id,
                    'item_name' => $quota->item->name,
                    'item_category' => $quota->item->category,
                    'item_description' => $quota->item->description,
                    'item_image_url' => $img && (str_starts_with((string) $img, 'http://') || str_starts_with((string) $img, 'https://'))
                        ? $img
                        : ($img ? url($img) : null),
                    'plan_title' => $quota->plan->title,
                    'plan_description' => $quota->plan->description,
                    'plan_period_type' => $quota->plan->period_type,
                    'plan_ends_at' => $quota->plan->ends_at->format('M d, Y'),
                    'total_qty' => $quota->total_qty,
                    'used_qty' => $quota->used_qty,
                    'remaining_qty' => $quota->remaining_qty,
                    'status' => $quota->status,
                    'percentage_used' => $quota->total_qty > 0
                        ? round(($quota->used_qty / $quota->total_qty) * 100)
                        : 0,
                ];
            });

        return Inertia::render('employee/quota', [
            'quotas' => $quotas,
            'employee_name' => Auth::user()?->name,
        ]);
    }

    public function use(Request $request, EmployeeQuota $quota): RedirectResponse
    {
        $employee = Auth::user()?->employee;

        if ($quota->employee_id !== $employee->id) {
            abort(403, 'This quota does not belong to you.');
        }

        $isMealCategory = strcasecmp(trim((string) $quota->item?->category), 'meal') === 0;

        try {
            if ($isMealCategory) {
                app(QuotaService::class)->requestMealQuota($quota, 1);

                return redirect()->back()->with('success', 'Meal request submitted and waiting for admin approval.');
            }

            app(QuotaService::class)->useQuota($quota, 1);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Quota used successfully!');
    }

    public function history(): Response
    {
        $employee = Auth::user()?->employee;

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

    public function notifications(): Response
    {
        $user = Auth::user();

        $notifications = AppNotification::query()
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->limit(80)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'kind' => $notification->type,
                'subject' => $notification->title,
                'body' => $notification->message,
                'status' => 'sent',
                'failed_reason' => null,
                'created_at' => $notification->created_at?->format('M d, Y h:i A'),
            ]);

        return Inertia::render('employee/notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function feedback(): Response
    {
        $employee = Auth::user()?->employee;

        $messages = MailMessage::query()
            ->where('employee_id', $employee?->id)
            ->whereIn('kind', ['issue_report', 'feature_request'])
            ->latest('created_at')
            ->limit(80)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'kind' => $m->kind,
                'subject' => $m->subject,
                'body' => $m->body,
                'attachments' => collect($m->attachments ?? [])->map(fn ($path) => url($path))->values(),
                'created_at' => $m->created_at?->format('M d, Y h:i A'),
            ]);

        $replies = MailMessage::query()
            ->where('employee_id', $employee?->id)
            ->whereIn('kind', ['admin_reply', 'employee_reply'])
            ->whereNotNull('reply_to_id')
            ->latest('created_at')
            ->limit(120)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'reply_to_id' => $m->reply_to_id,
                'subject' => $m->subject,
                'body' => $m->body,
                'attachments' => collect($m->attachments ?? [])->map(fn ($path) => url($path))->values(),
                'created_at' => $m->created_at?->format('M d, Y h:i A'),
                'kind' => $m->kind,
            ]);

        return Inertia::render('employee/feedback', [
            'messages' => $messages,
            'replies' => $replies,
        ]);
    }

    public function submitFeedback(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kind' => 'required|in:issue_report,feature_request',
            'subject' => 'required|string|max:150',
            'body' => 'required|string|max:5000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|extensions:jpg,jpeg,png,webp|max:4096',
        ]);

        $user = $request->user();
        $employee = $user->employee;
        $toAddress = (string) config('mail.from.address');

        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $attachmentPaths[] = PublicDiskUpload::store(
                    $file,
                    'feedback-attachments',
                );
            }
        }

        MailMessage::create([
            'kind' => $validated['kind'],
            'direction' => 'to_admin',
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'from_email' => (string) $user->email,
            'to_email' => $toAddress !== '' ? $toAddress : (string) $user->email,
            'employee_id' => $employee?->id,
            'status' => 'sent',
            'attachments' => $attachmentPaths,
        ]);

        $title = $validated['kind'] === 'feature_request' ? 'New feature request' : 'New issue report';
        $message = "{$user->name}: {$validated['subject']}";

        User::query()
            ->where('role', 'super_admin')
            ->where('is_active', true)
            ->each(function (User $admin) use ($title, $message) {
                app(NotificationService::class)->saveInApp($admin, 'employee_feedback', $title, $message);
            });

        return redirect()->route('employee.feedback.index')->with('success', 'Your message was sent to admin.');
    }

    public function replyFeedback(Request $request, MailMessage $message): RedirectResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $employee = $request->user()->employee;
        if (! $employee || $message->employee_id !== $employee->id) {
            abort(403, 'This request does not belong to you.');
        }
        if (! in_array($message->kind, ['issue_report', 'feature_request'], true)) {
            return redirect()->route('employee.feedback.index')->with('error', 'Reply can only be sent on request threads.');
        }

        MailMessage::create([
            'kind' => 'employee_reply',
            'direction' => 'to_admin',
            'subject' => "Re: {$message->subject}",
            'body' => $validated['body'],
            'from_email' => (string) $request->user()->email,
            'to_email' => (string) config('mail.from.address'),
            'employee_id' => $employee->id,
            'reply_to_id' => $message->id,
            'status' => 'sent',
        ]);

        User::query()
            ->where('role', 'super_admin')
            ->where('is_active', true)
            ->each(function (User $admin) use ($validated, $message) {
                app(NotificationService::class)->saveInApp(
                    $admin,
                    'general',
                    'Employee replied to request',
                    $validated['body'],
                    $message->id
                );
            });

        return redirect()->route('employee.feedback.index')->with('success', 'Your reply was sent to admin.');
    }

    public function deleteFeedback(Request $request, MailMessage $message): RedirectResponse
    {
        $employee = $request->user()->employee;
        if (! $employee || $message->employee_id !== $employee->id) {
            abort(403, 'This request does not belong to you.');
        }
        if (! in_array($message->kind, ['issue_report', 'feature_request'], true)) {
            return redirect()->route('employee.feedback.index')->with('error', 'Only request threads can be deleted.');
        }

        MailMessage::query()->where('reply_to_id', $message->id)->delete();
        $message->delete();

        return redirect()->route('employee.feedback.index')->with('success', 'Request deleted successfully.');
    }
}
