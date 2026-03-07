<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveSampleResultRequest extends FormRequest
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
            'action' => ['required', 'in:draft,approve'],
            'approval_date' => ['nullable', 'date'],
            'technical_remarks' => ['nullable', 'string'],
            'parameters' => ['required', 'array'],
            'parameters.*.key' => ['required', 'string', 'max:100'],
            'parameters.*.value' => ['nullable', 'string', 'max:100'],
            'parameters.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
