<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicDoctorAppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'slot_time' => ['required', 'string', 'max:20'],
            'patient_name' => ['required', 'string', 'max:150'],
            'patient_phone' => ['required', 'string', 'max:20'],
            'patient_email' => ['nullable', 'email', 'max:120'],
            'patient_gender' => ['nullable', 'in:male,female,other'],
            'patient_age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'patient_address' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'in:upi,card,cash'],
            'payment_status' => ['required', 'in:success,failed'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
