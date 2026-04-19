<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\BudgetItem;
use App\Models\Program;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index()
    {
        $programs = Program::where('status', 'approved')
            ->with(['budget.items', 'pin.barangay', 'budget.updatedBy'])
            ->orderBy('start_at')
            ->get()
            ->map(fn($p) => [
                'id'               => $p->id,
                'title'            => $p->title,
                'category'         => $p->category,
                'description'      => $p->description,
                'location'         => $p->location,
                'pin' => $p->pin ? ['id' => $p->pin->id, 'barangay' => $p->pin->barangay->name ?? null] : null,
                'start_at'         => $p->start_at->toIso8601String(),
                'end_at'           => $p->end_at->toIso8601String(),
                'budget'           => $p->budget ? $this->formatBudget($p->budget) : null,
            ]);

        return view('admin.budgets.index', [
            'programs'   => $programs,
            'categories' => Program::$categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id'       => 'required|exists:programs,id',
            'allocated_amount' => 'required|numeric|min:0',
            'items'            => 'required|array|min:1',
            'items.*.name'     => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes'            => 'nullable|string',
        ]);

        $program = Program::findOrFail($validated['program_id']);

        if ($program->status !== 'approved') {
            return response()->json(['message' => 'Budgets can only be created for approved programs.'], 422);
        }

        if ($program->budget) {
            return response()->json(['message' => 'This program already has a budget. Please edit it instead.'], 422);
        }

        $budget = Budget::create([
            'program_id'       => $validated['program_id'],
            'allocated_amount' => $validated['allocated_amount'],
            'notes'            => $validated['notes'] ?? null,
            'updated_by'       => auth()->id(),
        ]);

        foreach ($validated['items'] as $index => $item) {
            BudgetItem::create([
                'budget_id'  => $budget->id,
                'name'       => $item['name'],
                'quantity'   => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total'      => $item['quantity'] * $item['unit_price'],
                'order'      => $index,
            ]);
        }

        return response()->json([
            'success' => true,
            'budget'  => $this->formatBudget($budget->load('items', 'updatedBy')),
        ], 201);
    }

    public function update(Request $request, Budget $budget)
    {
        $validated = $request->validate([
            'allocated_amount'   => 'required|numeric|min:0',
            'items'              => 'required|array|min:1',
            'items.*.name'       => 'required|string|max:255',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes'              => 'nullable|string',
        ]);

        $budget->update([
            'allocated_amount' => $validated['allocated_amount'],
            'notes'            => $validated['notes'] ?? null,
            'updated_by'       => auth()->id(),
        ]);

        // Full replace of items
        $budget->items()->delete();

        foreach ($validated['items'] as $index => $item) {
            BudgetItem::create([
                'budget_id'  => $budget->id,
                'name'       => $item['name'],
                'quantity'   => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total'      => $item['quantity'] * $item['unit_price'],
                'order'      => $index,
            ]);
        }

        return response()->json([
            'success' => true,
            'budget'  => $this->formatBudget($budget->load('items', 'updatedBy')),
        ]);
    }

    public function destroy(Budget $budget)
    {
        if (!auth()->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Only Super Admins can delete budgets.'], 403);
        }

        $budget->delete();
        return response()->json(['success' => true]);
    }

    private function formatBudget(Budget $budget): array
    {
        $grandTotal = $budget->items->sum('total');

        return [
            'id'               => $budget->id,
            'program_id'       => $budget->program_id,
            'allocated_amount' => (float) $budget->allocated_amount,
            'notes'            => $budget->notes,
            'grand_total'      => (float) $grandTotal,
            'remaining'        => (float) $budget->allocated_amount - (float) $grandTotal,
            'updated_by'       => $budget->updatedBy ? [
                'id'   => $budget->updatedBy->id,
                'name' => $budget->updatedBy->name,
            ] : null,
            'updated_at'       => $budget->updated_at->toIso8601String(),
            'items'            => $budget->items->map(fn($i) => [
                'id'         => $i->id,
                'name'       => $i->name,
                'quantity'   => $i->quantity,
                'unit_price' => (float) $i->unit_price,
                'total'      => (float) $i->total,
                'order'      => $i->order,
            ])->values()->all(),
        ];
    }
}