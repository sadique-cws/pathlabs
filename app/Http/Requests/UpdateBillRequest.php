<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBillRequest extends FormRequest
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
            'billing_at' => ['required', 'date'],
            'sample_collected_from' => ['nullable', 'string', 'max:100'],
            'insurance_details' => ['nullable', 'string', 'max:255'],
            'offer' => ['nullable', 'string', 'max:120'],
            'doctor_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'doctor_discount_type' => ['nullable', 'in:fixed,percent'],
            'center_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'center_discount_type' => ['nullable', 'in:fixed,percent'],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'previous_reports' => ['nullable', 'string', 'max:255'],
            'agent_referrer' => ['nullable', 'string', 'max:150'],
            'notes' => ['nullable', 'string'],
            'urgent' => ['nullable', 'boolean'],
            'soft_copy_only' => ['nullable', 'boolean'],
            'send_message' => ['nullable', 'boolean'],
            'patient.name' => ['required', 'string', 'max:255'],
            'patient.phone' => ['required', 'string', 'max:20'],
            'patient.gender' => ['nullable', 'string', 'max:20'],
            'patient.age_years' => ['nullable', 'integer', 'min:0', 'max:120'],
            'patient.city' => ['nullable', 'string', 'max:100'],
            'patient.address' => ['nullable', 'string', 'max:255'],
            'patient.state' => ['nullable', 'string', 'max:100'],
            'patient.pin_code' => ['nullable', 'string', 'max:20'],
        ];
    }
}
