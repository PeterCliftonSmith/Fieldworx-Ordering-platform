<?php

declare(strict_types=1);

function app_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $path = dirname(__DIR__) . '/config.php';
    if (!is_file($path)) {
        $path = dirname(__DIR__) . '/config.example.php';
    }
    $config = require $path;
    return $config;
}

function base_path(string $path = ''): string
{
    $root = dirname(__DIR__);
    return $path === '' ? $root : $root . '/' . ltrim($path, '/');
}

function url(string $path = '/'): string
{
    $base = rtrim((string) (app_config()['base_url'] ?? ''), '/');
    if ($path === '' || $path === '/') {
        return $base === '' ? '/' : $base . '/';
    }
    return $base . '/' . ltrim($path, '/');
}

function redirect(string $path): never
{
    header('Location: ' . url($path));
    exit;
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function money_round(float $amount): float
{
    return round($amount, 2);
}

function price_incl_from_ex(float $ex, ?float $rate = null): float
{
    $rate ??= (float) app_config()['vat_rate'];
    return money_round($ex * (1 + $rate));
}

function price_ex_from_incl(float $incl, ?float $rate = null): float
{
    $rate ??= (float) app_config()['vat_rate'];
    return money_round($incl / (1 + $rate));
}

function format_zar(float|int|string $amount): string
{
    return 'R' . number_format((float) $amount, 2, '.', ',');
}

function slugify(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-') ?: 'item';
}

function unique_slug(string $base, callable $exists): string
{
    $slug = slugify($base) ?: ('item-' . bin2hex(random_bytes(3)));
    if (!$exists($slug)) {
        return $slug;
    }
    $n = 2;
    while ($exists($slug . '-' . $n)) {
        $n++;
    }
    return $slug . '-' . $n;
}

function new_id(string $prefix): string
{
    return $prefix . '-' . base_convert((string) time(), 10, 36) . '-' . bin2hex(random_bytes(3));
}

function request_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function is_post(): bool
{
    return request_method() === 'POST';
}

function post(string $key, mixed $default = ''): mixed
{
    return $_POST[$key] ?? $default;
}

function flash_set(string $type, string $message): void
{
    $_SESSION['_flash'] = ['type' => $type, 'message' => $message];
}

function flash_get(): ?array
{
    if (!isset($_SESSION['_flash'])) {
        return null;
    }
    $flash = $_SESSION['_flash'];
    unset($_SESSION['_flash']);
    return $flash;
}

function csrf_token(): string
{
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): void
{
    $token = (string) ($_POST['_csrf'] ?? '');
    if ($token === '' || empty($_SESSION['_csrf']) || !hash_equals($_SESSION['_csrf'], $token)) {
        http_response_code(400);
        exit('Invalid security token. Please go back and try again.');
    }
}

function render(string $view, array $data = [], string $layout = 'layout'): void
{
    extract($data, EXTR_SKIP);
    $viewFile = base_path('app/Views/' . $view . '.php');
    if (!is_file($viewFile)) {
        http_response_code(500);
        exit('View not found: ' . e($view));
    }
    ob_start();
    require $viewFile;
    $content = ob_get_clean();
    require base_path('app/Views/' . $layout . '.php');
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function current_path(): string
{
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $base = rtrim((string) (app_config()['base_url'] ?? ''), '/');
    if ($base !== '' && str_starts_with($uri, $base)) {
        $uri = substr($uri, strlen($base)) ?: '/';
    }
    return $uri === '' ? '/' : $uri;
}
