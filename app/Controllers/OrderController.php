<?php

declare(strict_types=1);

final class OrderController
{
    public static function draft(): void
    {
        Auth::requireCustomer();
        render('orders/draft', [
            'title' => 'Current order',
            'customer' => Auth::customer(),
        ]);
    }

    public static function submit(): void
    {
        $customer = Auth::requireCustomer();
        $raw = file_get_contents('php://input');
        $payload = json_decode($raw ?: '[]', true);
        if (!is_array($payload)) {
            json_response(['error' => 'Invalid order payload.'], 400);
        }

        $lines = $payload['lines'] ?? $payload;
        if (!is_array($lines)) {
            json_response(['error' => 'Invalid order lines.'], 400);
        }

        try {
            $order = Order::create($customer, $lines);
            json_response(['order' => $order], 201);
        } catch (Throwable $e) {
            json_response(['error' => $e->getMessage()], 400);
        }
    }

    public static function history(): void
    {
        $customer = Auth::requireCustomer();
        render('orders/index', [
            'title' => 'Order history',
            'orders' => Order::forCustomer($customer['id']),
        ]);
    }

    public static function show(string $id): void
    {
        $customer = Auth::requireCustomer();
        $order = Order::findForCustomer($id, $customer['id']);
        if (!$order) {
            http_response_code(404);
            render('errors/404', ['title' => 'Order not found']);
            return;
        }
        render('orders/show', [
            'title' => 'Order ' . $order['id'],
            'order' => $order,
        ]);
    }
}
