<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsEmployee
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isEmployee()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied. Employees only.'], 403);
            }

            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
