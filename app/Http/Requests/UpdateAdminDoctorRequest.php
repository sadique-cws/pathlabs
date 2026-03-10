<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdminDoctorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'specialization' => ['nullable', 'string', 'max:120'],
            'doctor_type' => ['required', 'in:lab_doctor,specialist'],
            'consultation_fee' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'can_approve_reports' => ['required', 'boolean'],
            'commission_type' => ['required', 'in:fixed,percent'],
            'commission_value' => ['required', 'numeric', 'min:0'],
        ];
    }
}
