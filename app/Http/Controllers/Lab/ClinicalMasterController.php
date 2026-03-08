<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\LabTest;
use App\Models\TestPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClinicalMasterController extends Controller
{
    public function manageTests(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $search = $request->input('search');

        $query = LabTest::query()
            ->where(function ($q) use ($labId): void {
                $q->where('lab_id', $labId)
                    ->orWhere('is_system', true);
            });

        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $tests = $query->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('lab/clinical-master/tests', [
            'tests' => collect($tests->items())->map(fn(LabTest $t): array => [
                'id' => $t->id,
                'name' => $t->name,
                'code' => $t->code,
                'sample_type' => $t->sample_type ?? '-',
                'department' => $t->department ?? '-',
                'price' => (float) $t->price,
                'is_system' => $t->is_system,
                'is_active' => $t->is_active,
                'can_edit' => !$t->is_system || $request->user()->hasRole('admin'),
            ])->all(),
            'pagination' => [
                'current_page' => $tests->currentPage(),
                'last_page' => $tests->lastPage(),
                'total' => $tests->total(),
            ],
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    public function storeTest(Request $request): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $isAdmin = $request->user()->hasRole('admin') || $request->user()->hasRole('super_admin');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'sample_type' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
        ]);

        $data = $validated;
        if ($isAdmin) {
            $data['is_system'] = true;
            $data['lab_id'] = null; // or keep current lab_id if preferred, but null marks it global
        } else {
            $data['is_system'] = false;
            $data['lab_id'] = $labId;
        }

        LabTest::query()->create($data);

        return back()->with('success', 'Test added successfully.');
    }

    public function updateTest(Request $request, LabTest $test): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $isAdmin = $request->user()->hasRole('admin') || $request->user()->hasRole('super_admin');

        if ($test->is_system && !$isAdmin) {
            abort(403, 'You cannot modify system tests.');
        }

        if (!$test->is_system && $test->lab_id !== $labId && !$isAdmin) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'sample_type' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
        ]);

        $test->update($validated);

        return back()->with('success', 'Test updated successfully.');
    }

    public function destroyTest(Request $request, LabTest $test): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $isAdmin = $request->user()->hasRole('admin') || $request->user()->hasRole('super_admin');

        if ($test->is_system && !$isAdmin) {
            abort(403, 'You cannot delete system tests.');
        }

        if (!$test->is_system && $test->lab_id !== $labId && !$isAdmin) {
            abort(403);
        }

        $test->delete();

        return back()->with('success', 'Test deleted successfully.');
    }

    public function managePackages(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $search = $request->input('search');

        $query = TestPackage::query()
            ->where(function ($q) use ($labId): void {
                $q->where('lab_id', $labId)
                    ->orWhere('is_system', true);
            })
            ->with('tests:id,name');

        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $packages = $query->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        $availableTests = LabTest::query()
            ->where(function ($q) use ($labId): void {
                $q->where('lab_id', $labId)
                    ->orWhere('is_system', true);
            })
            ->get(['id', 'name', 'price']);

        return Inertia::render('lab/clinical-master/packages', [
            'packages' => collect($packages->items())->map(fn(TestPackage $p): array => [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'price' => (float) $p->price,
                'is_system' => $p->is_system,
                'is_active' => $p->is_active,
                'test_ids' => $p->tests->pluck('id')->all(),
                'test_names' => $p->tests->pluck('name')->all(),
                'can_edit' => !$p->is_system || $request->user()->hasRole('admin'),
            ])->all(),
            'availableTests' => $availableTests,
            'pagination' => [
                'current_page' => $packages->currentPage(),
                'last_page' => $packages->lastPage(),
                'total' => $packages->total(),
            ],
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    public function storePackage(Request $request): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $isAdmin = $request->user()->hasRole('admin') || $request->user()->hasRole('super_admin');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'test_ids' => 'required|array',
            'test_ids.*' => 'exists:tests,id',
        ]);

        $data = [
            'name' => $validated['name'],
            'code' => $validated['code'],
            'price' => $validated['price'],
        ];

        if ($isAdmin) {
            $data['is_system'] = true;
            $data['lab_id'] = null;
        } else {
            $data['is_system'] = false;
            $data['lab_id'] = $labId;
        }

        $package = TestPackage::query()->create($data);
        $package->tests()->sync($validated['test_ids']);

        return back()->with('success', 'Package created successfully.');
    }

    public function updatePackage(Request $request, TestPackage $package): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $isAdmin = $request->user()->hasRole('admin') || $request->user()->hasRole('super_admin');

        if ($package->is_system && !$isAdmin) {
            abort(403, 'You cannot modify system packages.');
        }

        if (!$package->is_system && $package->lab_id !== $labId && !$isAdmin) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'test_ids' => 'required|array',
            'test_ids.*' => 'exists:tests,id',
        ]);

        $package->update([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'price' => $validated['price'],
        ]);

        $package->tests()->sync($validated['test_ids']);

        return back()->with('success', 'Package updated successfully.');
    }

    public function destroyPackage(Request $request, TestPackage $package): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $isAdmin = $request->user()->hasRole('admin') || $request->user()->hasRole('super_admin');

        if ($package->is_system && !$isAdmin) {
            abort(403, 'You cannot delete system packages.');
        }

        if (!$package->is_system && $package->lab_id !== $labId && !$isAdmin) {
            abort(403);
        }

        $package->delete();

        return back()->with('success', 'Package deleted successfully.');
    }
}
