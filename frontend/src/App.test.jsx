import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
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
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});
