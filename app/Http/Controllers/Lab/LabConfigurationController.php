<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LabConfigurationController extends Controller
{
    /**
     * Show the lab configuration page.
     */
    public function show(Request $request): \Inertia\Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $lab = $user->lab;

        return Inertia::render('lab/configuration', [
            'lab' => $lab ? [
                'id' => $lab->id,
                'name' => $lab->name,
                'code' => $lab->code,
                'phone' => $lab->phone,
                'logo_path' => $lab->logo_path,
                'logo_url' => $lab->logo_path ? Storage::url($lab->logo_path) : null,
                'email' => $lab->email,
                'website' => $lab->website,
                'established_year' => $lab->established_year,
                'address' => $lab->address,
                'city' => $lab->city,
                'state' => $lab->state,
                'pincode' => $lab->pincode,
                'nearest_location' => $lab->nearest_location,
                'payment_receive_account' => $lab->payment_receive_account ?? 'cash',
                'upi_qr_code_path' => $lab->upi_qr_code_path,
                'upi_qr_code_url' => $lab->upi_qr_code_path ? Storage::url($lab->upi_qr_code_path) : null,
                'online_booking_available' => (bool) $lab->online_booking_available,
                'home_sample_collection' => (bool) $lab->home_sample_collection,
                'gst_number' => $lab->gst_number,
                'lab_license_number' => $lab->lab_license_number,
                'lab_director_name' => $lab->lab_director_name,
                'technician_name' => $lab->technician_name,
                'technician_qualification' => $lab->technician_qualification,
                'technician_license_number' => $lab->technician_license_number,
                'technician_signature_path' => $lab->technician_signature_path,
                'technician_signature_url' => $lab->technician_signature_path ? Storage::url($lab->technician_signature_path) : null,
            ] : null,
        ]);
    }

    /**
     * Update the lab configuration.
     */
    public function update(Request $request): \Illuminate\Http\RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $lab = $user->lab;

        if (!$lab) {
            return back()->withErrors(['lab' => 'No lab context found.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'established_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'address' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:10',
            'nearest_location' => 'nullable|string|max:255',
            'payment_receive_account' => 'nullable|string|in:cash,direct',
            'online_booking_available' => 'boolean',
            'home_sample_collection' => 'boolean',
            'gst_number' => 'nullable|string|max:20',
            'lab_license_number' => 'nullable|string|max:50',
            'lab_director_name' => 'nullable|string|max:255',
            'technician_name' => 'nullable|string|max:255',
            'technician_qualification' => 'nullable|string|max:255',
            'technician_license_number' => 'nullable|string|max:50',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,svg|max:2048',
            'upi_qr_code' => 'nullable|image|mimes:jpg,jpeg,png,svg|max:2048',
            'technician_signature' => 'nullable|image|mimes:jpg,jpeg,png,svg|max:2048',
        ]);

        // Handle file uploads
        if ($request->hasFile('logo')) {
            if ($lab->logo_path) {
                Storage::disk('public')->delete($lab->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('labs/logos', 'public');
        }

        if ($request->hasFile('upi_qr_code')) {
            if ($lab->upi_qr_code_path) {
                Storage::disk('public')->delete($lab->upi_qr_code_path);
            }
            $validated['upi_qr_code_path'] = $request->file('upi_qr_code')->store('labs/qr-codes', 'public');
        }

        if ($request->hasFile('technician_signature')) {
            if ($lab->technician_signature_path) {
                Storage::disk('public')->delete($lab->technician_signature_path);
            }
            $validated['technician_signature_path'] = $request->file('technician_signature')->store('labs/signatures', 'public');
        }

        // Remove file input keys (we stored paths above)
        unset($validated['logo'], $validated['upi_qr_code'], $validated['technician_signature']);

        $lab->update($validated);

        return back()->with('success', 'Lab configuration updated successfully.');
    }
}
