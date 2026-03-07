<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use App\Models\TestParameter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TestParameterController extends Controller
{
    public function index(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $search = $request->input('search');
        $testId = $request->input('test_id');

        $query = TestParameter::query()
            ->whereHas('test', function ($q) use ($labId): void {
                $q->where('lab_id', $labId);
            })
            ->with(['test:id,name,code']);

        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('test', function ($t) use ($search): void {
                        $t->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    });
            });
        }

        if ($testId !== null && $testId !== '') {
            $query->where('test_id', $testId);
        }

        $parameters = $query->orderBy('test_id')->orderBy('id')->paginate(50)->withQueryString();

        $tests = LabTest::query()->where('lab_id', $labId)->orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('test-reports/manage-parameters', [
            'parameters' => collect($parameters->items())->map(fn(TestParameter $p): array => [
                'id' => $p->id,
                'test_id' => $p->test_id,
                'test_name' => $p->test?->name ?? '',
                'test_code' => $p->test?->code ?? '',
                'name' => $p->name ?? '',
                'unit' => $p->unit ?? '-',
                'normal_range' => $p->normal_range ?? '-',
            ])->all(),
            'tests' => $tests->map(fn(LabTest $t): array => [
                'id' => $t->id,
                'name' => $t->name,
                'code' => $t->code,
            ])->all(),
            'pagination' => [
                'current_page' => $parameters->currentPage(),
                'last_page' => $parameters->lastPage(),
                'per_page' => $parameters->perPage(),
                'total' => $parameters->total(),
            ],
            'filters' => [
                'search' => $search ?? '',
                'test_id' => $testId ?? '',
            ]
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');

        $validated = $request->validate([
            'test_id' => ['required', 'exists:tests,id'],
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:100'],
            'normal_range' => ['nullable', 'string', 'max:255'],
        ]);

        $test = LabTest::query()->where('lab_id', $labId)->findOrFail($validated['test_id']);

        $test->parameters()->create([
            'name' => (string) $validated['name'],
            'unit' => $validated['unit'] !== null ? (string) $validated['unit'] : null,
            'normal_range' => $validated['normal_range'] !== null ? (string) $validated['normal_range'] : null,
        ]);

        return redirect()->back()->with('success', 'Parameter created successfully.');
    }

    public function update(Request $request, TestParameter $testParameter): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');

        $testParameter->load('test');
        abort_if($testParameter->test === null || $testParameter->test->lab_id !== $labId, 404);

        $validated = $request->validate([
            'test_id' => ['required', 'exists:tests,id'],
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:100'],
            'normal_range' => ['nullable', 'string', 'max:255'],
        ]);

        LabTest::query()->where('lab_id', $labId)->findOrFail($validated['test_id']);

        $testParameter->update([
            'test_id' => $validated['test_id'],
            'name' => (string) $validated['name'],
            'unit' => $validated['unit'] !== null ? (string) $validated['unit'] : null,
            'normal_range' => $validated['normal_range'] !== null ? (string) $validated['normal_range'] : null,
        ]);

        return redirect()->back()->with('success', 'Parameter updated successfully.');
    }

    public function destroy(Request $request, TestParameter $testParameter): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');

        $testParameter->load('test');
        abort_if($testParameter->test === null || $testParameter->test->lab_id !== $labId, 404);

        $testParameter->delete();

        return redirect()->back()->with('success', 'Parameter deleted successfully.');
    }
}
