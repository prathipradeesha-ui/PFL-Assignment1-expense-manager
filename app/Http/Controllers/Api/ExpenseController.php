<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expense;

class ExpenseController extends Controller
{
    // List all expenses belonging to the logged-in user only.
    // Using the relationship (not Expense::all()) keeps data private per user.
    public function index(Request $request)
    {
        return $request->user()->expenses;
    }

    // Create a new expense for the logged-in user.
    // Validates all required fields before saving to the database.
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'cost_gbp' => 'required|numeric|min:0',
            'description' => 'required|string|max:1000',
            'expense_type' => 'required|in:travel,food,other',
        ]);

        // create() via the relationship auto-attaches the current user's ID
        $expense = $request->user()->expenses()->create($validated);

        return response()->json($expense, 201);
    }

    // Show one expense's details.
    // Route model binding auto-fetches the Expense by ID (404 if not found).
    // authorize() checks ExpensePolicy - only the owner can view it.
    public function show(Expense $expense)
    {
        $this->authorize('view', $expense);
        return $expense;
    }


    // Update an existing expense. Only the owner is authorized to do this.
    // "sometimes" rule = fields are optional but must be valid if sent.
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

    // Delete an expense. Only the owner is authorized to do this.
    // Returns 204 No Content - the correct REST response for a successful delete.
    public function destroy(Expense $expense)
    {
        $this->authorize('delete', $expense);
        $expense->delete();
        return response()->json(null, 204);
    }
}
