<?php

declare(strict_types=1);

final class AuthController
{
    public static function loginForm(): void
    {
        if (Auth::customer()) {
            redirect('/order');
        }
        render('auth/login', [
            'title' => 'Sign in',
            'next' => (string) ($_GET['next'] ?? '/order'),
            'error' => null,
        ]);
    }

    public static function login(): void
    {
        verify_csrf();
        $username = strtolower(trim((string) post('username')));
        $password = (string) post('password');
        $next = (string) post('next', '/order');
        if ($next === '' || !str_starts_with($next, '/')) {
            $next = '/order';
        }

        $registration = Registration::findByUsername($username);
        $error = null;

        if (!$registration || !Registration::verifyPassword($registration, $password)) {
            $error = 'Incorrect username or password.';
        } elseif ($registration['status'] === 'pending') {
            $error = 'Your account is still pending Fieldworx approval.';
        } elseif ($registration['status'] === 'rejected') {
            $error = 'This registration was not approved. Contact Fieldworx for help.';
        }

        if ($error) {
            render('auth/login', [
                'title' => 'Sign in',
                'next' => $next,
                'error' => $error,
                'username' => $username,
            ]);
            return;
        }

        Auth::loginCustomer($registration);
        redirect($next);
    }

    public static function logout(): void
    {
        verify_csrf();
        Auth::logoutCustomer();
        redirect('/');
    }
}
