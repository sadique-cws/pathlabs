<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreBillRequest extends FormRequest
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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['nullable', 'integer', 'exists:patients,id'],
            'patient.name' => ['required_without:patient_id', 'string', 'max:255'],
            'patient.phone' => ['required_without:patient_id', 'string', 'max:20'],
            'patient.title' => ['nullable', 'string', 'max:20'],
            'patient.gender' => ['nullable', 'string', 'max:20'],
            'patient.date_of_birth' => ['nullable', 'date'],
            'patient.age_years' => ['nullable', 'integer', 'min:0', 'max:120'],
            'patient.age_months' => ['nullable', 'integer', 'min:0', 'max:11'],
            'patient.age_days' => ['nullable', 'integer', 'min:0', 'max:31'],
            'patient.address' => ['nullable', 'string', 'max:255'],
            'patient.city' => ['nullable', 'string', 'max:100'],
            'patient.landmark' => ['nullable', 'string', 'max:255'],
            'patient.weight_kg' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'patient.height_cm' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'patient.state' => ['nullable', 'string', 'max:100'],
            'patient.pin_code' => ['nullable', 'string', 'max:20'],
            'patient.uhid' => ['nullable', 'string', 'max:100'],
            'patient.id_type' => ['nullable', 'string', 'max:50'],
            'doctor_id' => ['nullable', 'integer', 'exists:doctors,id'],
            'doctor_name' => ['nullable', 'string', 'max:255'],
            'doctor_phone' => ['nullable', 'string', 'max:20'],
            'collection_center_id' => ['nullable', 'integer', 'exists:collection_centers,id'],
            'test_ids' => ['nullable', 'array'],
            'test_ids.*' => ['integer', 'exists:tests,id'],
            'sample_quantity' => ['nullable', 'integer', 'min:1', 'max:20'],
            'package_ids' => ['nullable', 'array'],
            'package_ids.*' => ['integer', 'exists:test_packages,id'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'doctor_discount' => ['nullable', 'numeric', 'min:0'],
            'doctor_discount_type' => ['nullable', 'in:fixed,percent'],
            'center_discount' => ['nullable', 'numeric', 'min:0'],
            'center_discount_type' => ['nullable', 'in:fixed,percent'],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'billing_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'sample_collected_from' => ['nullable', 'string', 'max:100'],
            'insurance_details' => ['nullable', 'string', 'max:255'],
            'service_other_charges' => ['nullable', 'array'],
            'service_other_charges.*.name' => ['required_with:service_other_charges', 'string', 'max:120'],
            'service_other_charges.*.amount' => ['required_with:service_other_charges', 'numeric', 'min:0'],
            'offer' => ['nullable', 'string', 'max:120'],
            'previous_reports' => ['nullable', 'string', 'max:255'],
            'agent_referrer' => ['nullable', 'string', 'max:150'],
            'urgent' => ['nullable', 'boolean'],
            'soft_copy_only' => ['nullable', 'boolean'],
            'send_message' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'patient.name.required_without' => 'Patient name is required when patient is not selected.',
            'patient.phone.required_without' => 'Patient phone is required when patient is not selected.',
            'doctor_id.exists' => 'Selected referral doctor is invalid.',
            'collection_center_id.exists' => 'Selected collection center is invalid.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $testIds = $this->input('test_ids', []);
            $packageIds = $this->input('package_ids', []);

            if ($testIds === [] && $packageIds === []) {
                $validator->errors()->add('test_ids', 'At least one test or package must be selected.');
            }
        });
    }
}
