<?php

declare(strict_types=1);

final class Order
{
    public static function forCustomer(string $customerId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC'
        );
        $stmt->execute([$customerId]);
        return $stmt->fetchAll();
    }

    public static function findForCustomer(string $orderId, string $customerId): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM orders WHERE id = ? AND customer_id = ? LIMIT 1'
        );
        $stmt->execute([$orderId, $customerId]);
        $order = $stmt->fetch();
        if (!$order) {
            return null;
        }
        $order['lines'] = self::linesFor($orderId);
        return $order;
    }

    public static function linesFor(string $orderId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM order_lines WHERE order_id = ? ORDER BY id'
        );
        $stmt->execute([$orderId]);
        return $stmt->fetchAll();
    }

    public static function create(array $customer, array $lines): array
    {
        if ($lines === []) {
            throw new InvalidArgumentException('Add at least one product before submitting an order.');
        }

        $normalized = [];
        $subtotalEx = 0.0;
        $totalIncl = 0.0;

        foreach ($lines as $line) {
            $qty = (int) ($line['quantity'] ?? 0);
            $priceEx = (float) ($line['price_ex_vat'] ?? $line['priceExVat'] ?? -1);
            $priceIncl = (float) ($line['price_incl_vat'] ?? $line['priceInclVat'] ?? -1);
            $name = trim((string) ($line['name'] ?? ''));
            $productId = trim((string) ($line['product_id'] ?? $line['productId'] ?? ''));
            $supplierId = trim((string) ($line['supplier_id'] ?? $line['supplierId'] ?? ''));

            if ($name === '' || $productId === '' || $supplierId === '') {
                throw new InvalidArgumentException('Each order line needs a supplier, product, and name.');
            }
            if ($qty <= 0) {
                throw new InvalidArgumentException('Each order line needs a valid quantity.');
            }
            if ($priceEx < 0 || $priceIncl < 0) {
                throw new InvalidArgumentException('Each order line needs valid prices.');
            }

            $priceEx = money_round($priceEx);
            $priceIncl = money_round($priceIncl);
            $subtotalEx += $priceEx * $qty;
            $totalIncl += $priceIncl * $qty;

            $normalized[] = [
                'supplier_id' => $supplierId,
                'supplier_name' => (string) ($line['supplier_name'] ?? $line['supplierName'] ?? 'Supplier'),
                'product_id' => $productId,
                'name' => $name,
                'variation_id' => self::nullableString($line['variation_id'] ?? $line['variationId'] ?? null),
                'variation_name' => self::nullableString($line['variation_name'] ?? $line['variationName'] ?? null),
                'unit' => (string) ($line['unit'] ?? ''),
                'image' => (string) ($line['image'] ?? ''),
                'image_alt' => (string) ($line['image_alt'] ?? $line['imageAlt'] ?? $name),
                'price_ex_vat' => $priceEx,
                'price_incl_vat' => $priceIncl,
                'quantity' => $qty,
            ];
        }

        $subtotalEx = money_round($subtotalEx);
        $totalIncl = money_round($totalIncl);
        $vat = money_round($totalIncl - $subtotalEx);
        $id = new_id('ord');

        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            $pdo->prepare(
                'INSERT INTO orders
                (id, created_at, customer_id, username, trading_name, status, subtotal_ex_vat, vat_total, total_incl_vat)
                VALUES (?,?,?,?,?,?,?,?,?)'
            )->execute([
                $id,
                date('Y-m-d H:i:s'),
                $customer['id'],
                $customer['username'],
                $customer['tradingName'],
                'submitted',
                $subtotalEx,
                $vat,
                $totalIncl,
            ]);

            $insert = $pdo->prepare(
                'INSERT INTO order_lines
                (order_id, supplier_id, supplier_name, product_id, name, variation_id, variation_name,
                 unit, image, image_alt, price_ex_vat, price_incl_vat, quantity)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
            );
            foreach ($normalized as $line) {
                $insert->execute([
                    $id,
                    $line['supplier_id'],
                    $line['supplier_name'],
                    $line['product_id'],
                    $line['name'],
                    $line['variation_id'],
                    $line['variation_name'],
                    $line['unit'],
                    $line['image'],
                    $line['image_alt'],
                    $line['price_ex_vat'],
                    $line['price_incl_vat'],
                    $line['quantity'],
                ]);
            }

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        return self::findForCustomer($id, $customer['id']) ?? ['id' => $id];
    }

    private static function nullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }
        $value = trim((string) $value);
        return $value === '' ? null : $value;
    }
}
