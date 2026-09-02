import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('App - logged out state', () => {
  it('renders the login form by default', () => {
    render(<App />);
    expect(screen.getByText('Expense Management System')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('switches to the register form when Register tab is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('requires email and password fields on the login form', () => {
    render(<App />);
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Password')).toBeRequired();
  });
});

describe('App - logged in state', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-test-token');
  });

  it('shows the dashboard with recent transactions after login', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, date: '2026-08-20', cost_gbp: '45.50', description: 'Taxi ride', expense_type: 'travel' },
      ]),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Taxi ride')).toBeInTheDocument();
    });
  });

  it('shows a total for each expense type on the dashboard', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, date: '2026-08-20', cost_gbp: '10.00', description: 'Item A', expense_type: 'food' },
        { id: 2, date: '2026-08-21', cost_gbp: '20.00', description: 'Item B', expense_type: 'other' },
      ]),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('£10.00').length).toBeGreaterThan(0);
      expect(screen.getAllByText('£20.00').length).toBeGreaterThan(0);
    });
  });

  it('switches to the Expenses tab and shows the expense list', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        { id: 1, date: '2026-08-20', cost_gbp: '45.50', description: 'Taxi ride', expense_type: 'travel' },
      ]),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Taxi ride')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Expenses'));

    await waitFor(() => {
      expect(screen.getByText('Your Expenses')).toBeInTheDocument();
    });
  });
});

describe('App - additional interactions', () => {
  it('logs in successfully and shows the dashboard', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'new-token', user: { id: 1, name: 'Test User' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
      });

    render(<App />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(screen.getByText('Log out')).toBeInTheDocument();
    });
  });

  it('shows an error message on failed login', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'The provided credentials are incorrect.' }),
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(screen.getByText('The provided credentials are incorrect.')).toBeInTheDocument();
    });
  });
});

describe('App - expense CRUD interactions', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-test-token');
  });

  it('adds a new expense successfully', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ([]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, description: 'New Item' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 1, date: '2026-08-20', cost_gbp: '15.00', description: 'New Item', expense_type: 'food' }]) });

    render(<App />);

    await waitFor(() => screen.getByText('Expenses'));
    fireEvent.click(screen.getByText('Expenses'));
    fireEvent.click(screen.getByText('+ Add Expense'));

    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-08-20' } });
    fireEvent.change(screen.getByLabelText('Cost (GBP)'), { target: { value: '15.00' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Item' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('New Item')).toBeInTheDocument();
    });
  });

  it('deletes an expense after confirming in the modal', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: 1, date: '2026-08-20', cost_gbp: '15.00', description: 'To Delete', expense_type: 'food' }]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ([]) });

    render(<App />);

    await waitFor(() => screen.getByText('Expenses'));
    fireEvent.click(screen.getByText('Expenses'));

    await waitFor(() => screen.getByText('To Delete'));
    fireEvent.click(screen.getByLabelText('Delete To Delete'));

    await waitFor(() => screen.getByText('Confirm Delete'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });
  });

  it('logs out and returns to the login screen', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ([]) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<App />);

    await waitFor(() => screen.getByText('Log out'));
    fireEvent.click(screen.getByText('Log out'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    });
  });
});
