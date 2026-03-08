<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $labId = $user->lab_id;

        $staff = User::query()
            ->where('lab_id', $labId)
            ->with('roles')
            ->orderBy('name')
            ->get()
            ->map(function (User $u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'is_approver' => $u->is_approver,
                    'qualification' => $u->qualification,
                    'signature_url' => $u->signature_path ? Storage::url($u->signature_path) : null,
                    'roles' => $u->roles->map(fn($role) => $role->name)->all(),
                ];
            });

        return Inertia::render('lab/staff/index', [
            'staff' => $staff,
        ]);
    }

    public function update(Request $request, User $staffMember): \Illuminate\Http\RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($staffMember->lab_id !== $user->lab_id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'is_approver' => 'boolean',
            'qualification' => 'nullable|string|max:255',
            'signature' => 'nullable|image|mimes:jpg,jpeg,png,svg|max:2048',
        ]);

        $updateData = [
            'is_approver' => $validated['is_approver'] ?? false,
            'qualification' => $validated['qualification'],
        ];

        if ($request->hasFile('signature')) {
            if ($staffMember->signature_path) {
                Storage::disk('public')->delete($staffMember->signature_path);
            }
            $updateData['signature_path'] = $request->file('signature')->store('users/signatures', 'public');
        }

        $staffMember->update($updateData);

        return back()->with('success', 'Staff member updated successfully.');
    }
}
