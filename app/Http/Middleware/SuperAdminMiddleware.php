<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check() || !Auth::user()->isSuperAdmin()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden. Super Admin access required.'], 403);
            }
            return redirect()->route('admin.map');
        }
        return $next($request);
    }
}