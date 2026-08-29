<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;

// This Policy class holds all authorization rules for the Expense model,
// separate from the controller (as required by the assignment brief).
// Each method answers: "is $user allowed to do this to $expense?"
class ExpensePolicy
{
    // Only the expense's owner can view it.
    public function view(User $user, Expense $expense): bool
    {
        return $user->id === $expense->user_id;
    }

    // Only the expense's owner can update it.
    public function update(User $user, Expense $expense): bool
    {
        return $user->id === $expense->user_id;
    }

    // Only the expense's owner can delete it.
    public function delete(User $user, Expense $expense): bool
    {
        return $user->id === $expense->user_id;
    }
}
