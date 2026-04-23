<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Item;
use App\Models\QuotaPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $like = '%'.$q.'%';

        $employees = Employee::query()
            ->with('user:id,name')
            ->where(function ($w) use ($like) {
                $w->where('employee_code', 'like', $like)
                    ->orWhere('department', 'like', $like)
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $like));
            })
            ->limit(6)
            ->get()
            ->map(fn ($e) => [
                'type' => 'employee',
                'title' => $e->user?->name ?? 'Employee',
                'subtitle' => $e->employee_code.($e->department ? ' · '.$e->department : ''),
                'href' => '/admin/employees',
            ]);

        $items = Item::query()
            ->where(function ($w) use ($like) {
                $w->where('name', 'like', $like)
                    ->orWhere('category', 'like', $like);
            })
            ->limit(6)
            ->get()
            ->map(fn ($i) => [
                'type' => 'item',
                'title' => $i->name,
                'subtitle' => (string) $i->category,
                'href' => '/admin/items',
            ]);

        $plans = QuotaPlan::query()
            ->where('title', 'like', $like)
            ->limit(6)
            ->get()
            ->map(fn ($p) => [
                'type' => 'plan',
                'title' => $p->title,
                'subtitle' => 'Month plan',
                'href' => '/admin/plans',
            ]);

        return response()->json([
            'results' => $employees->concat($items)->concat($plans)->values()->all(),
        ]);
    }
}
