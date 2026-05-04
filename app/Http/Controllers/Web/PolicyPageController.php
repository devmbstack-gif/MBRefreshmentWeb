<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use Inertia\Inertia;
use Inertia\Response;

class PolicyPageController extends Controller
{
    public function terms(): Response
    {
        return $this->renderPage(Policy::TYPE_TERMS, 'legal/terms-of-use', 'Terms of use');
    }

    public function privacy(): Response
    {
        return $this->renderPage(Policy::TYPE_PRIVACY, 'legal/privacy-policy', 'Privacy policy');
    }

    private function renderPage(string $type, string $component, string $headTitle): Response
    {
        $policy = Policy::query()->where('type', $type)->firstOrFail();

        return Inertia::render($component, [
            'title' => $headTitle,
            'type' => $policy->type,
            'text' => $policy->text,
            'updated_at' => $policy->updated_at?->toIso8601String(),
        ]);
    }
}
