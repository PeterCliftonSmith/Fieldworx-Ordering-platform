<?php

declare(strict_types=1);

final class DashboardController
{
    public static function loginForm(): void
    {
        if (Auth::isAdmin()) {
            redirect('/admin');
        }
        render('admin/login', [
            'title' => 'Admin sign in',
            'error' => null,
            'next' => (string) ($_GET['next'] ?? '/admin'),
        ], 'admin-layout');
    }

    public static function login(): void
    {
        verify_csrf();
        $next = (string) post('next', '/admin');
        if ($next === '' || !str_starts_with($next, '/admin')) {
            $next = '/admin';
        }
        if (!Auth::loginAdmin((string) post('password'))) {
            render('admin/login', [
                'title' => 'Admin sign in',
                'error' => 'Incorrect admin password.',
                'next' => $next,
            ], 'admin-layout');
            return;
        }
        redirect($next);
    }

    public static function logout(): void
    {
        verify_csrf();
        Auth::logoutAdmin();
        redirect('/admin/login');
    }

    public static function index(): void
    {
        Auth::requireAdmin();
        render('admin/index', [
            'title' => 'Suppliers',
            'suppliers' => Supplier::listSummary(),
        ], 'admin-layout');
    }
}
