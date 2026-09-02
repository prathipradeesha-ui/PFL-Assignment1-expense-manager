import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API_URL = 'http://127.0.0.1:8000/api';

const TYPE_ICONS = {
  travel: '✈️',
  food: '🍔',
  other: '📦',
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [view, setView] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [expenseForm, setExpenseForm] = useState({ date: '', cost_gbp: '', description: '', expense_type: 'travel' });
  const [authMode, setAuthMode] = useState('login');
  const [error, setError] = useState('');

  const totalSpend = expenses.reduce((sum, exp) => sum + parseFloat(exp.cost_gbp), 0);
  const expenseCount = expenses.length;
  const avgSpend = expenseCount ? totalSpend / expenseCount : 0;

  useEffect(() => {
    if (token) fetchExpenses();
  }, [token]);

  async function fetchExpenses() {
    const res = await fetch(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setExpenses(data);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } else {
      setError(data.message || 'Login failed');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } else {
      setError(data.message || 'Registration failed');
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setExpenses([]);
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setError('');
    const isEditing = editingId !== null;
    const url = isEditing ? `${API_URL}/expenses/${editingId}` : `${API_URL}/expenses`;
    const method = isEditing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(expenseForm),
    });
    if (res.ok) {
      setExpenseForm({ date: '', cost_gbp: '', description: '', expense_type: 'travel' });
      setEditingId(null);
      setView('list');
      fetchExpenses();
    } else {
      const data = await res.json();
      setError(data.errors ? Object.values(data.errors).flat().join(" ") : (data.message || "Something went wrong."));
    }
  }

  function confirmDelete(expense) {
    setDeleteTarget(expense);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`${API_URL}/expenses/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteTarget(null);
    fetchExpenses();
  }

  function viewDetail(expense) {
    setSelectedExpense(expense);
    setView('detail');
  }

  function startEdit(expense) {
    setEditingId(expense.id);
    setExpenseForm({
      date: expense.date?.slice(0, 10),
      cost_gbp: expense.cost_gbp,
      description: expense.description,
      expense_type: expense.expense_type,
    });
    setView('add');
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <h1 className="text-xl font-semibold text-teal-900" style={{ fontSize: "1.25rem" }}>
              Expense Management System
            </h1>
          </div>
          <p className="text-sm text-slate-400 mb-5">Track spending, simply.</p>
          <div className="flex gap-1 mb-5 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={authMode === 'login' ? 'flex-1 py-2 rounded-md text-sm font-medium bg-teal-700 text-white shadow-sm' : 'flex-1 py-2 rounded-md text-sm font-medium text-slate-500'}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={authMode === 'register' ? 'flex-1 py-2 rounded-md text-sm font-medium bg-teal-700 text-white shadow-sm' : 'flex-1 py-2 rounded-md text-sm font-medium text-slate-500'}
            >
              Register
            </button>
          </div>

          {error && (
            <p className="text-rose-600 text-sm mb-3 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                required
                aria-label="Email"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                required
                aria-label="Password"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
              <button className="w-full bg-teal-700 hover:bg-teal-800 transition text-white py-2 rounded-md text-sm font-medium">
                Log in
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                required
                aria-label="Name"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                required
                aria-label="Email"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                required
                aria-label="Password"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm password"
                required
                aria-label="Confirm password"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={registerForm.password_confirmation}
                onChange={(e) => setRegisterForm({ ...registerForm, password_confirmation: e.target.value })}
              />
              <button className="w-full bg-teal-700 hover:bg-teal-800 transition text-white py-2 rounded-md text-sm font-medium">
                Register
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-teal-900 px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-white leading-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            Expense Management System
          </h1>
          <p className="text-xs text-teal-200 ml-4">Track spending, simply.</p>
        </div>
        <button onClick={handleLogout} className="text-sm text-teal-200 hover:text-white transition">
          Log out
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
          <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'px-4 py-1.5 rounded-md text-sm font-medium bg-teal-700 text-white' : 'px-4 py-1.5 rounded-md text-sm font-medium text-slate-500'}>
            Dashboard
          </button>
          <button onClick={() => setView('list')} className={(view === 'list' || view === 'add' || view === 'detail') ? 'px-4 py-1.5 rounded-md text-sm font-medium bg-teal-700 text-white' : 'px-4 py-1.5 rounded-md text-sm font-medium text-slate-500'}>
            Expenses
          </button>
        </div>

        {view === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {['travel', 'food', 'other'].map((type) => {
                const typeExpenses = expenses.filter((e) => e.expense_type === type);
                const typeTotal = typeExpenses.reduce((sum, e) => sum + parseFloat(e.cost_gbp), 0);
                return (
                  <div key={type} className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-2xl mb-1" aria-hidden="true">{TYPE_ICONS[type]}</p>
                    <p className="text-xs text-slate-400 capitalize">{type}</p>
                    <p className="font-semibold text-teal-800">£{typeTotal.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="text-lg font-medium text-slate-700 mb-4">Spending Breakdown</h2>
              {totalSpend > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={['travel', 'food', 'other'].map((type) => ({
                        name: type,
                        value: expenses.filter((e) => e.expense_type === type).reduce((sum, e) => sum + parseFloat(e.cost_gbp), 0),
                      })).filter((d) => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.name + ': £' + entry.value.toFixed(2)}
                    >
                      <Cell fill="#0f766e" />
                      <Cell fill="#d97706" />
                      <Cell fill="#64748b" />
                    </Pie>
                    <Tooltip formatter={(value) => '£' + value.toFixed(2)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 text-sm">No data to chart yet.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="text-lg font-medium text-slate-700 mb-4">Recent Transactions</h2>
              {expenses.length === 0 && (
                <p className="text-slate-400 text-sm">No transactions yet.</p>
              )}
              <ul className="space-y-3">
                {expenses.slice(0, 5).map((exp) => (
                  <li key={exp.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{TYPE_ICONS[exp.expense_type]}</span>
                      <span>
                        <p className="text-sm font-medium text-slate-800">{exp.description}</p>
                        <p className="text-xs text-slate-400">{exp.date?.slice(0, 10)}</p>
                      </span>
                    </span>
                    <span className="font-semibold text-amber-600 text-sm">£{exp.cost_gbp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {view === 'list' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-slate-700">Your Expenses</h2>
              <button
                onClick={() => { setEditingId(null); setExpenseForm({ date: '', cost_gbp: '', description: '', expense_type: 'travel' }); setView('add'); }}
                className="bg-teal-700 hover:bg-teal-800 transition text-white text-sm px-4 py-2 rounded-md shadow-sm"
              >
                + Add Expense
              </button>
            </div>

            {expenses.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No expenses yet. Add your first one above.</p>
              </div>
            )}

            <ul className="space-y-2">
              {expenses.map((exp) => (
                <li
                  key={exp.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 flex justify-between items-center hover:border-teal-200 transition"
                >
                  <button
                    onClick={() => viewDetail(exp)}
                    className="text-left flex-1 flex items-center gap-3"
                    aria-label={"View details for " + exp.description}
                  >
                    <span className="text-xl" aria-hidden="true">{TYPE_ICONS[exp.expense_type]}</span>
                    <span>
                      <p className="font-medium text-slate-800">{exp.description}</p>
                      <p className="text-sm text-slate-400">
                        {exp.date?.slice(0, 10)} · <span className="capitalize">{exp.expense_type}</span>
                      </p>
                    </span>
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-amber-600">£{exp.cost_gbp}</span>
                    <button
                      onClick={() => startEdit(exp)}
                      aria-label={"Edit " + exp.description}
                      className="text-teal-600 text-sm hover:text-teal-800 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(exp)}
                      aria-label={"Delete " + exp.description}
                      className="text-rose-500 text-sm hover:text-rose-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {view === 'add' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-medium text-slate-700 mb-4">
              {editingId ? 'Edit Expense' : 'Add Expense'}
            </h2>
            {error && (
              <p className="text-rose-600 text-sm mb-3 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1" htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  required
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1" htmlFor="cost">Cost (GBP)</label>
                <input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={expenseForm.cost_gbp}
                  onChange={(e) => setExpenseForm({ ...expenseForm, cost_gbp: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1" htmlFor="description">Description</label>
                <input
                  id="description"
                  type="text"
                  required
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1" htmlFor="type">Expense Type</label>
                <select
                  id="type"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={expenseForm.expense_type}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_type: e.target.value })}
                >
                  <option value="travel">Travel</option>
                  <option value="food">Food</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 transition text-white px-4 py-2 rounded-md text-sm">
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setView('list'); }}
                  className="bg-slate-100 hover:bg-slate-200 transition text-slate-600 px-4 py-2 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'detail' && selectedExpense && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <button onClick={() => setView('list')} className="text-sm text-teal-700 mb-4">
              Back
            </button>
            <h2 className="text-lg font-medium text-slate-700 mb-4 flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">{TYPE_ICONS[selectedExpense.expense_type]}</span>
              Expense Details
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between pb-2">
                <dt className="text-slate-400">Description</dt>
                <dd className="text-slate-800 font-medium">{selectedExpense.description}</dd>
              </div>
              <div className="flex justify-between pb-2">
                <dt className="text-slate-400">Date</dt>
                <dd className="text-slate-800 font-medium">{selectedExpense.date?.slice(0, 10)}</dd>
              </div>
              <div className="flex justify-between pb-2">
                <dt className="text-slate-400">Cost</dt>
                <dd className="text-amber-600 font-semibold">£{selectedExpense.cost_gbp}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Type</dt>
                <dd className="text-slate-800 font-medium capitalize">{selectedExpense.expense_type}</dd>
              </div>
            </dl>
          </div>
        )}
      </main>

      {deleteTarget && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteTarget(null)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{deleteTarget.description}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
