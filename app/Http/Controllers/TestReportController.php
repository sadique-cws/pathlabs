<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveSampleResultRequest;
use App\Models\Sample;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TestReportController extends Controller
{
    public function testUnits(): Response
    {
        $units = collect([
            'mIU/mL',
            'U/mL',
            'ug/mL',
            'IU/mL',
            '/uL',
            'nmol/L',
            'ng/dL',
            'umol/L',
            'min',
            'sec',
        ])->values();

        return Inertia::render('test-reports/test-units', [
            'units' => $units->map(fn(string $name, int $index): array => [
                'id' => $index + 1,
                'name' => $name,
                'created_date' => now()->subDays($index)->format('d/m/Y'),
                'updated_date' => now()->subDays($index)->format('d/m/Y'),
            ])->all(),
            'totals' => [
                'total_units' => $units->count(),
                'available_units' => $units->count(),
            ],
        ]);
    }

    public function testMethods(): Response
    {
        $methods = collect([
            'Coagulation',
            'Sedimentation',
            'Ion Selective Electrode',
            'None',
            'Mass Spectrometry',
            'Flow Cytometry',
            'Chromatography',
            'Electrophoresis',
            'Nephelometry',
            'Visual',
        ])->values();

        return Inertia::render('test-reports/test-methods', [
            'methods' => $methods->map(fn(string $name, int $index): array => [
                'id' => $index + 1,
                'name' => $name,
                'created_date' => now()->subDays($index)->format('d/m/Y'),
                'updated_date' => now()->subDays($index)->format('d/m/Y'),
            ])->all(),
            'totals' => [
                'total_methods' => $methods->count(),
                'available_methods' => $methods->count(),
            ],
        ]);
    }

    public function resultEntry(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $statusFilter = $request->input('status', '');
        $departmentFilter = $request->input('department', '');

        $query = Sample::query()
            ->where('lab_id', $labId)
            ->with([
                'bill:id,bill_number,billing_at,patient_id',
                'bill.patient:id,name,phone,gender,age_years',
                'test:id,name,sample_type,department',
            ])
            ->latest('id')
            ->limit(400);

        if ($statusFilter !== '') {
            $query->where('status', $statusFilter);
        }

        if ($departmentFilter !== '') {
            $query->whereHas('test', function ($q) use ($departmentFilter): void {
                $q->where('department', $departmentFilter);
            });
        }

        $samples = $query->get();

        $statusMap = [
            'pending' => 'Pending',
            'collected' => 'Collected',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
        ];

        $rows = $samples->map(function (Sample $sample) use ($statusMap): array {
            return [
                'id' => $sample->id,
                'barcode' => $sample->barcode ?? '-',
                'bill_number' => $sample->bill?->bill_number ?? '-',
                'patient_name' => $sample->bill?->patient?->name ?? '-',
                'patient_phone' => $sample->bill?->patient?->phone ?? '-',
                'patient_gender' => $sample->bill?->patient?->gender ?? '-',
                'patient_age' => $sample->bill?->patient?->age_years ?? 0,
                'test_name' => $sample->test?->name ?? '-',
                'department' => ucfirst((string) ($sample->test?->department ?? 'pathology')),
                'sample_type' => $sample->test?->sample_type !== null && $sample->test?->sample_type !== ''
                    ? ucfirst($sample->test->sample_type)
                    : 'None',
                'bill_date' => $sample->bill?->billing_at?->format('d/m/Y') ?? '-',
                'status' => $statusMap[$sample->status] ?? ucfirst((string) $sample->status),
            ];
        })->values();

        return Inertia::render('test-reports/result-entry', [
            'rows' => $rows->all(),
            'stats' => [
                'pending' => $rows->where('status', 'Pending')->count(),
                'collected' => $rows->where('status', 'Collected')->count(),
                'in_progress' => $rows->where('status', 'In Progress')->count(),
                'completed' => $rows->where('status', 'Completed')->count(),
                'total' => $rows->count(),
            ],
            'filters' => [
                'status' => $statusFilter,
                'department' => $departmentFilter,
            ],
        ]);
    }

    public function resultEntryDetail(Request $request, Sample $sample): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($sample->lab_id !== $labId, 404);

        $sample->load(['bill:id,bill_number,billing_at,patient_id', 'bill.patient:id,name,phone,gender,age_years,dob', 'test:id,name,sample_type,department', 'test.parameters']);

        $dbParameters = $sample->test?->parameters;

        $parameterTemplate = $dbParameters && $dbParameters->isNotEmpty()
            ? $dbParameters->map(fn($p) => [
                'key' => 'param_' . $p->id,
                'name' => $p->name,
                'unit' => $p->unit ?? '-',
                'normal_range' => $p->normal_range ?? '-',
            ])->all()
            : $this->parameterTemplateForTest($sample->test?->name);

        $savedValues = collect($sample->result_payload ?? [])->keyBy('key');
        $parameters = collect($parameterTemplate)->map(function (array $parameter) use ($savedValues): array {
            $saved = $savedValues->get($parameter['key']);

            return [
                ...$parameter,
                'name' => is_array($saved) && isset($saved['name']) ? (string) $saved['name'] : $parameter['name'],
                'unit' => is_array($saved) && isset($saved['unit']) ? (string) $saved['unit'] : $parameter['unit'],
                'normal_range' => is_array($saved) && isset($saved['normal_range']) ? (string) $saved['normal_range'] : $parameter['normal_range'],
                'value' => is_array($saved) ? (string) ($saved['value'] ?? '') : '',
                'remarks' => is_array($saved) ? (string) ($saved['remarks'] ?? '') : '',
            ];
        })->all();

        /** @var \App\Models\User $user */
        $user = $request->user();
        $isDoctor = $user !== null && $user->hasRole('doctor');

        $approvedByName = null;
        if ($sample->approved_by) {
            $approver = \App\Models\User::query()->find($sample->approved_by);
            $approvedByName = $approver?->name;
        }

        return Inertia::render('test-reports/result-entry-form', [
            'sample' => [
                'id' => $sample->id,
                'barcode' => $sample->barcode ?? '-',
                'bill_number' => $sample->bill?->bill_number ?? '-',
                'test_name' => $sample->test?->name ?? '-',
                'department' => ucfirst((string) ($sample->test?->department ?? 'pathology')),
                'sample_type' => $sample->test?->sample_type !== null && $sample->test?->sample_type !== ''
                    ? ucfirst($sample->test->sample_type)
                    : 'None',
                'patient_name' => $sample->bill?->patient?->name ?? '-',
                'patient_phone' => $sample->bill?->patient?->phone ?? '-',
                'patient_gender' => $sample->bill?->patient?->gender !== null && $sample->bill?->patient?->gender !== '' ? ucfirst((string) $sample->bill?->patient?->gender) : '-',
                'patient_age' => $sample->bill?->patient?->age_years ?? 0,
                'bill_date' => $sample->bill?->billing_at?->format('Y-m-d') ?? now()->format('Y-m-d'),
                'status' => $sample->status ?? 'pending',
                'technical_remarks' => $sample->result_remarks ?? '',
                'approval_date' => $sample->approval_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
                'approved_by_name' => $approvedByName,
            ],
            'parameters' => $parameters,
            'userRole' => $isDoctor ? 'doctor' : 'lab_tech',
        ]);
    }

    public function saveResultEntry(SaveSampleResultRequest $request, Sample $sample): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($sample->lab_id !== $labId, 404);

        $validated = $request->validated();
        $action = (string) $validated['action'];

        /** @var \App\Models\User|null $user */
        $user = $request->user();

        $updateData = [
            'result_payload' => $validated['parameters'],
            'result_remarks' => $validated['technical_remarks'] ?? null,
        ];

        if ($action === 'approve') {
            $updateData['approval_date'] = $validated['approval_date'] ?? now()->toDateString();
            $updateData['approved_by'] = $user?->id;
            $updateData['status'] = 'completed';
        } elseif ($action === 'collect') {
            $updateData['status'] = 'collected';
            $updateData['collected_at'] = now();
        } else {
            // draft
            $updateData['status'] = 'in_progress';
        }

        $sample->update($updateData);

        $messages = [
            'approve' => 'Result approved and completed.',
            'collect' => 'Sample marked as collected.',
            'draft' => 'Result saved as draft.',
        ];

        return to_route('lab.test-reports.result-entry-detail', ['sample' => $sample->id])
            ->with('success', $messages[$action] ?? 'Saved.');
    }

    public function printReport(Request $request, Sample $sample): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($sample->lab_id !== $labId, 404);

        $sample->load([
            'bill:id,bill_number,billing_at,patient_id',
            'bill.patient:id,name,phone,gender,age_years,dob,address,city,state,pin_code',
            'test:id,name,sample_type,department',
            'test.parameters',
        ]);

        $dbParameters = $sample->test?->parameters;
        $parameterTemplate = $dbParameters && $dbParameters->isNotEmpty()
            ? $dbParameters->map(fn($p) => [
                'key' => 'param_' . $p->id,
                'name' => $p->name,
                'unit' => $p->unit ?? '-',
                'normal_range' => $p->normal_range ?? '-',
            ])->all()
            : $this->parameterTemplateForTest($sample->test?->name);

        $savedValues = collect($sample->result_payload ?? [])->keyBy('key');
        $parameters = collect($parameterTemplate)->map(function (array $parameter) use ($savedValues): array {
            $saved = $savedValues->get($parameter['key']);
            return [
                ...$parameter,
                'name' => is_array($saved) && isset($saved['name']) ? (string) $saved['name'] : $parameter['name'],
                'unit' => is_array($saved) && isset($saved['unit']) ? (string) $saved['unit'] : $parameter['unit'],
                'normal_range' => is_array($saved) && isset($saved['normal_range']) ? (string) $saved['normal_range'] : $parameter['normal_range'],
                'value' => is_array($saved) ? (string) ($saved['value'] ?? '') : '',
                'remarks' => is_array($saved) ? (string) ($saved['remarks'] ?? '') : '',
            ];
        })->all();

        $approvedByName = null;
        if ($sample->approved_by) {
            $approver = \App\Models\User::query()->find($sample->approved_by);
            $approvedByName = $approver?->name;
        }

        return Inertia::render('test-reports/print-report', [
            'sample' => [
                'id' => $sample->id,
                'barcode' => $sample->barcode ?? '-',
                'bill_number' => $sample->bill?->bill_number ?? '-',
                'test_name' => $sample->test?->name ?? '-',
                'department' => ucfirst((string) ($sample->test?->department ?? 'pathology')),
                'sample_type' => $sample->test?->sample_type !== null && $sample->test?->sample_type !== ''
                    ? ucfirst($sample->test->sample_type) : 'None',
                'status' => $sample->status ?? 'pending',
                'bill_date' => $sample->bill?->billing_at?->format('d M Y') ?? '-',
                'approval_date' => $sample->approval_date?->format('d M Y') ?? '-',
                'technical_remarks' => $sample->result_remarks ?? '',
                'approved_by_name' => $approvedByName,
            ],
            'patient' => [
                'name' => $sample->bill?->patient?->name ?? '-',
                'phone' => $sample->bill?->patient?->phone ?? '-',
                'gender' => $sample->bill?->patient?->gender !== null && $sample->bill?->patient?->gender !== '' ? ucfirst((string) $sample->bill?->patient?->gender) : '-',
                'age' => $sample->bill?->patient?->age_years ?? 0,
            ],
            'parameters' => $parameters,
        ]);
    }

    /**
     * @return array<int, array{key: string, name: string, unit: string, normal_range: string}>
     */
    private function parameterTemplateForTest(?string $testName): array
    {
        if ($testName !== null && str_contains(strtolower($testName), 'cbc')) {
            return [
                ['key' => 'hb', 'name' => 'Hemoglobin (Hb)', 'unit' => 'g/dL', 'normal_range' => '13.5 - 17.5'],
                ['key' => 'hct', 'name' => 'Hematocrit (Hct)', 'unit' => '%', 'normal_range' => '40 - 50'],
                ['key' => 'rbc', 'name' => 'RBC Count', 'unit' => '10^6/uL', 'normal_range' => '4.5 - 5.9'],
                ['key' => 'wbc', 'name' => 'WBC Count', 'unit' => '10^3/uL', 'normal_range' => '4.0 - 11.0'],
                ['key' => 'platelet', 'name' => 'Platelet Count', 'unit' => '10^3/uL', 'normal_range' => '150 - 450'],
                ['key' => 'neut', 'name' => 'Neutrophils', 'unit' => '%', 'normal_range' => '40 - 80'],
                ['key' => 'lymph', 'name' => 'Lymphocytes', 'unit' => '%', 'normal_range' => '20 - 40'],
                ['key' => 'eos', 'name' => 'Eosinophils', 'unit' => '%', 'normal_range' => '1 - 6'],
                ['key' => 'mono', 'name' => 'Monocytes', 'unit' => '%', 'normal_range' => '2 - 10'],
                ['key' => 'baso', 'name' => 'Basophils', 'unit' => '%', 'normal_range' => '0 - 1'],
            ];
        }

        return [
            ['key' => 'result', 'name' => 'Observation', 'unit' => '-', 'normal_range' => 'As per clinical range'],
            ['key' => 'remark', 'name' => 'Interpretation', 'unit' => '-', 'normal_range' => 'Doctor correlation advised'],
        ];
    }
}
