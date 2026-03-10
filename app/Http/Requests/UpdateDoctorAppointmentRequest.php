<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDoctorAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'appointment_at' => ['required', 'date'],
            'status' => ['required', 'in:scheduled,rescheduled,completed,cancelled'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
