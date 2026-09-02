<?php

use App\Models\Expense;
use App\Models\User;

test('a guest cannot access expenses', function () {
    $response = $this->getJson('/api/expenses');

    $response->assertStatus(401);
});

test('an authenticated user can create an expense', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/expenses', [
        'date' => '2026-08-20',
        'cost_gbp' => 45.50,
        'description' => 'Taxi to client meeting',
        'expense_type' => 'travel',
    ]);

    $response->assertStatus(201);
    $response->assertJsonFragment(['description' => 'Taxi to client meeting']);

    $this->assertDatabaseHas('expenses', [
        'description' => 'Taxi to client meeting',
        'user_id' => $user->id,
    ]);
});

test('creating an expense fails validation with missing fields', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/expenses', [
        'description' => 'Missing other fields',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['date', 'cost_gbp', 'expense_type']);
});

test('a user can view their own expense', function () {
    $user = User::factory()->create();
    $expense = Expense::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->getJson("/api/expenses/{$expense->id}");

    $response->assertStatus(200);
    $response->assertJsonFragment(['id' => $expense->id]);
});

test('a user cannot view another users expense', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $expense = Expense::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($otherUser, 'sanctum')->getJson("/api/expenses/{$expense->id}");

    $response->assertStatus(403);
});

test('a user can update their own expense', function () {
    $user = User::factory()->create();
    $expense = Expense::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->putJson("/api/expenses/{$expense->id}", [
        'description' => 'Updated description',
    ]);

    $response->assertStatus(200);
    $response->assertJsonFragment(['description' => 'Updated description']);
});

test('a user can delete their own expense', function () {
    $user = User::factory()->create();
    $expense = Expense::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/expenses/{$expense->id}");

    $response->assertStatus(204);
    $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
});

test('a user cannot update another users expense', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $expense = Expense::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($otherUser, 'sanctum')->putJson("/api/expenses/{$expense->id}", [
        'description' => 'Hacked description',
    ]);

    $response->assertStatus(403);
});

test('a user cannot delete another users expense', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $expense = Expense::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($otherUser, 'sanctum')->deleteJson("/api/expenses/{$expense->id}");

    $response->assertStatus(403);
    $this->assertDatabaseHas('expenses', ['id' => $expense->id]);
});

test('the expense list does not expose other users expenses', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    Expense::factory()->create(['user_id' => $userA->id, 'description' => 'User A expense']);
    Expense::factory()->create(['user_id' => $userB->id, 'description' => 'User B expense']);

    $response = $this->actingAs($userA, 'sanctum')->getJson('/api/expenses');

    $response->assertStatus(200);
    $response->assertJsonCount(1);
    $response->assertJsonFragment(['description' => 'User A expense']);
    $response->assertJsonMissing(['description' => 'User B expense']);
});

test('creating an expense with an invalid expense type is rejected', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/expenses', [
        'date' => '2026-08-20',
        'cost_gbp' => 10.00,
        'description' => 'Test',
        'expense_type' => 'invalid_type',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['expense_type']);
});

test('requesting a nonexistent expense returns 404', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/expenses/999999');

    $response->assertStatus(404);
});
