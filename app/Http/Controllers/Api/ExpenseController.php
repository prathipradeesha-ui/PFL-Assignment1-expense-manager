<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expense;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->expenses;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'cost_gbp' => 'required|numeric|min:0',
            'description' => 'required|string|max:1000',
            'expense_type' => 'required|in:travel,food,other',
        ]);

        $expense = $request->user()->expenses()->create($validated);

        return response()->json($expense, 201);
    }

    public function show(Expense $expense)
    {
        $this->authorize('view', $expense);

        return $expense;
    }

    public function update(Request $request, Expense $expense)
    {
        $this->authorize('update', $expense);

        $validated = $request->validate([
            'date' => 'sometimes|required|date',
            'cost_gbp' => 'sometimes|required|numeric|min:0',
            'description' => 'sometimes|required|string|max:1000',
            'expense_type' => 'sometimes|required|in:travel,food,other',
        ]);

        $expense->update($validated);

        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $this->authorize('delete', $expense);

        $expense->delete();

        return response()->json(null, 204);
    }
}
