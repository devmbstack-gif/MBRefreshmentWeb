<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PolicyController extends Controller
{
    public function index(): Response
    {
        $terms = Policy::query()->where('type', Policy::TYPE_TERMS)->firstOrFail();
        $privacy = Policy::query()->where('type', Policy::TYPE_PRIVACY)->firstOrFail();

        return Inertia::render('admin/policies', [
            'terms' => [
                'type' => $terms->type,
                'text' => $terms->text,
                'updated_at' => $terms->updated_at?->toIso8601String(),
            ],
            'privacy' => [
                'type' => $privacy->type,
                'text' => $privacy->text,
                'updated_at' => $privacy->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request, string $type): RedirectResponse
    {
        abort_unless(in_array($type, Policy::types(), true), 404);

        $validated = $request->validate([
            'text' => ['required', 'string', 'max:200000'],
        ]);

        $policy = Policy::query()->where('type', $type)->firstOrFail();
        $policy->update(['text' => $validated['text']]);

        $label = $type === Policy::TYPE_TERMS ? 'Terms of use' : 'Privacy policy';

        return redirect()
            ->route('admin.policies.index')
            ->with('success', "{$label} saved.");
    }
}
