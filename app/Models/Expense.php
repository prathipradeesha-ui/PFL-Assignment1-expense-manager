<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;
    protected $fillable = [
    'date',
    'cost_gbp',
    'description',
    'expense_type',
];

protected $casts = [
    'date' => 'date',
    'cost_gbp' => 'decimal:2',
];
}
