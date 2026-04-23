<?php

namespace App\Http\Controllers\Web\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeQuota;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;
        if (! $employee) {
            return response()->json(['results' => []]);
        }

        $q = trim((string) $request->query('q', ''));
        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $like = '%'.$q.'%';

        $quotas = EmployeeQuota::query()
            ->where('employee_id', $employee->id)
            ->with(['item:id,name,category', 'plan:id,title'])
            ->where(function ($w) use ($like) {
                $w->whereHas('item', fn ($i) => $i->where('name', 'like', $like))
                    ->orWhereHas('plan', fn ($p) => $p->where('title', 'like', $like));
            })
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'type' => 'quota',
                'title' => $row->item?->name ?? 'Item',
                'subtitle' => ($row->plan?->title ?? 'Plan').' · '.$row->remaining_qty.' left',
                'href' => '/employee/quota',
            ]);

        return response()->json(['results' => $quotas->values()->all()]);
    }
}
