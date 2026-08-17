<?php

declare(strict_types=1);

final class Router
{
    /** @var array<int, array{methods: string[], pattern: string, handler: callable}> */
    private array $routes = [];

    public function get(string $pattern, callable $handler): void
    {
        $this->add(['GET'], $pattern, $handler);
    }

    public function post(string $pattern, callable $handler): void
    {
        $this->add(['POST'], $pattern, $handler);
    }

    public function add(array $methods, string $pattern, callable $handler): void
    {
        $this->routes[] = [
            'methods' => array_map('strtoupper', $methods),
            'pattern' => $pattern,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $path): void
    {
        $method = strtoupper($method);
        $path = $path === '' ? '/' : $path;

        foreach ($this->routes as $route) {
            if (!in_array($method, $route['methods'], true)) {
                continue;
            }
            $regex = '@^' . preg_replace('@\{([a-zA-Z_][a-zA-Z0-9_]*)\}@', '(?P<$1>[^/]+)', $route['pattern']) . '$@';
            if (!preg_match($regex, $path, $matches)) {
                continue;
            }
            $params = array_filter(
                $matches,
                static fn ($key) => !is_int($key),
                ARRAY_FILTER_USE_KEY,
            );
            ($route['handler'])(...array_values($params));
            return;
        }

        http_response_code(404);
        render('errors/404', ['title' => 'Not found']);
    }
}
