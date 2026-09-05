# Expense Management System

A full-stack web application for managing personal expenses.

Backend:Laravel + Sanctum (REST API)  
Frontend:React + Vite + Tailwind CSS + Recharts

## Features
- User registration and login (Sanctum token authentication)
- Create, view, update and delete expenses
- Expense types: Travel, Food, Other
- Dashboard with totals and pie chart
- Ownership protection using Laravel Policies
- Automated tests on both server and client

## Setup

### Backend
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate