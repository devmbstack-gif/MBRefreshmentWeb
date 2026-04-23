<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\MailMessage;
use Illuminate\Http\JsonResponse;

class MailMessageController extends Controller
{
    public function index(): JsonResponse
    {
        $messages = MailMessage::query()
            ->with('employee.user:id,name')
            ->latest()
            ->limit(80)
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
                'created_at' => $m->created_at?->toIso8601String(),
                'employee_name' => $m->employee?->user?->name,
            ]);

        return response()->json(['messages' => $messages]);
    }
}
