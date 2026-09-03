<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;

// This Policy class holds authorisation rules for the Expense model,
// keeping authorisation logic separate from the controller.
// create() via the relationship auto-attaches the current user's ID
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
