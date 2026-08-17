<?php

declare(strict_types=1);

final class SupplierController
{
    public static function index(): void
    {
        render('suppliers/index', [
            'title' => 'Suppliers',
            'suppliers' => Supplier::listSummary(),
        ]);
    }

    public static function show(string $id): void
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            http_response_code(404);
            render('errors/404', ['title' => 'Supplier not found']);
            return;
        }

        $customer = Auth::customer();
        $showPrices = $customer !== null;
        $products = array_map(
            static fn (array $product) => Supplier::presentProduct($product, $showPrices),
            $supplier['products'] ?? [],
        );

        render('suppliers/show', [
            'title' => $supplier['name'],
            'supplier' => $supplier,
            'products' => $products,
            'showPrices' => $showPrices,
            'customer' => $customer,
        ]);
    }
}
