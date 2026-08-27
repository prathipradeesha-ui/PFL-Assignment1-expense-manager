import { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [view, setView] = useState('list');
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [expenseForm, setExpenseForm] = useState({ date: '', cost_gbp: '', description: '', expense_type: 'travel' });
  const [authMode, setAuthMode] = useState('login');
  const [error, setError] = useState('');

  // Calculate the total cost of all expenses for the summary display
  const totalSpend = expenses.reduce((sum, exp) => sum + parseFloat(exp.cost_gbp), 0);

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

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setExpenses([]);
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(expenseForm),
    });
    if (res.ok) {
      setExpenseForm({ date: '', cost_gbp: '', description: '', expense_type: 'travel' });
      setView('list');
      fetchExpenses();
    } else {
      const data = await res.json();
      setError(JSON.stringify(data.errors || data.message));
    }
  }

  async function handleDelete(id) {
    await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchExpenses();
  }

  function viewDetail(expense) {
    setSelectedExpense(expense);
    setView('detail');
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <h1 className="text-xl font-semibold text-teal-900">
              Expense Management System
            </h1>
          </div>
          <p className="text-sm text-slate-400 mb-5">Track spending, simply.</p>

          <div className="flex gap-1 mb-5 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={authMode === 'login'
                ? 'flex-1 py-2 rounded-md text-sm font-medium transition bg-teal-700 text-white shadow-sm'
                : 'flex-1 py-2 rounded-md text-sm font-medium transition text-slate-500'}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={authMode === 'register'
                ? 'flex-1 py-2 rounded-md text-sm font-medium transition bg-teal-700 text-white shadow-sm'
                : 'flex-1 py-2 rounded-md text-sm font-medium transition text-slate-500'}
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
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <div>
            <h1 className="font-semibold text-white leading-tight">Expense Management System</h1>
            <p className="text-xs text-teal-200">Track spending, simply.</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm text-teal-200 hover:text-white transition">
          Log out
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {view === 'list' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-slate-700">Your Expenses</h2>
              <p className="text-sm text-slate-500 mb-3">Total spend: <span className="font-semibold text-amber-600">£{totalSpend.toFixed(2)}</span></p>
              <button
                onClick={() => setView('add')}
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
                    className="text-left flex-1"
                    aria-label={"View details for " + exp.description}
                  >
                    <p className="font-medium text-slate-800">{exp.description}</p>
                    <p className="text-sm text-slate-400">
                      {exp.date?.slice(0, 10)} · <span className="capitalize">{exp.expense_type}</span>
                    </p>
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-amber-600">£{exp.cost_gbp}</span>
                    <button
                      onClick={() => handleDelete(exp.id)}
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
            <h2 className="text-lg font-medium text-slate-700 mb-4">Add Expense</h2>
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
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
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
            <h2 className="text-lg font-medium text-slate-700 mb-4">Expense Details</h2>
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
    </div>
  );
}

export default App;
