<?php

declare(strict_types=1);

final class Auth
{
    public static function startSession(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        $name = app_config()['session_name'] ?? 'fieldworx_sess';
        session_name($name);
        session_set_cookie_params([
            'lifetime' => 60 * 60 * 12,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        ]);
        session_start();
    }

    public static function customer(): ?array
    {
        $id = $_SESSION['customer_id'] ?? null;
        if (!$id) {
            return null;
        }
        $row = Registration::find((string) $id);
        if (!$row || $row['status'] !== 'approved') {
            self::logoutCustomer();
            return null;
        }
        return [
            'id' => $row['id'],
            'username' => $row['username'],
            'tradingName' => $row['trading_name'],
            'registeredBusinessName' => $row['registered_business_name'],
            'status' => $row['status'],
        ];
    }

    public static function requireCustomer(): array
    {
        $customer = self::customer();
        if (!$customer) {
            $next = current_path();
            redirect('/login?next=' . rawurlencode($next));
        }
        return $customer;
    }

    public static function loginCustomer(array $registration): void
    {
        session_regenerate_id(true);
        $_SESSION['customer_id'] = $registration['id'];
        $_SESSION['customer_username'] = $registration['username'];
    }

    public static function logoutCustomer(): void
    {
        unset($_SESSION['customer_id'], $_SESSION['customer_username']);
    }

    public static function isAdmin(): bool
    {
        return !empty($_SESSION['is_admin']);
    }

    public static function requireAdmin(): void
    {
        if (!self::isAdmin()) {
            redirect('/admin/login?next=' . rawurlencode(current_path()));
        }
    }

    public static function loginAdmin(string $password): bool
    {
        $expected = (string) (app_config()['admin_password'] ?? 'fieldworx-admin');
        if (!hash_equals($expected, $password)) {
            return false;
        }
        session_regenerate_id(true);
        $_SESSION['is_admin'] = true;
        return true;
    }

    public static function logoutAdmin(): void
    {
        unset($_SESSION['is_admin']);
    }
}
