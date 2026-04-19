<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = User::orderByRaw("role = 'super_admin' DESC")
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->role,
                'is_active'  => $u->is_active,
                'created_at' => $u->created_at->format('M d, Y'),
            ]);

        return view('admin.accounts.index', compact('accounts'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'role'      => 'admin',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'account' => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'role'      => $user->role,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at->format('M d, Y'),
            ],
        ], 201);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        if (!Hash::check($validated['current_password'], auth()->user()->password)) {
            return response()->json([
                'success' => false,
                'errors'  => ['current_password' => ['Current password is incorrect.']],
            ], 422);
        }

        auth()->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['success' => true]);
    }
    
    public function toggle(Request $request, User $user)
    {
        // Prevent deactivating your own account or other super admins
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 403);
        }

        if ($user->isSuperAdmin()) {
            return response()->json(['message' => 'Super Admin accounts cannot be deactivated.'], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success'   => true,
            'is_active' => $user->is_active,
        ]);
    }
}