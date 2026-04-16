<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isSuperAdmin()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied. Super admin only.'], 403);
            }

            return redirect()->route('employee.quota.index');
        }

        return $next($request);
    }
}
