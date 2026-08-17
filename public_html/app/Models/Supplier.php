<?php

declare(strict_types=1);

final class Supplier
{
    public static function all(): array
    {
        $pdo = Database::pdo();
        $suppliers = $pdo->query('SELECT * FROM suppliers ORDER BY sort_order, name')->fetchAll();
        foreach ($suppliers as &$supplier) {
            $supplier['products'] = self::productsFor($supplier['id'], true);
        }
        return $suppliers;
    }

    public static function listSummary(): array
    {
        return Database::pdo()
            ->query('SELECT * FROM suppliers ORDER BY sort_order, name')
            ->fetchAll();
    }

    public static function find(string $id, bool $withProducts = true): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM suppliers WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $supplier = $stmt->fetch();
        if (!$supplier) {
            return null;
        }
        if ($withProducts) {
            $supplier['products'] = self::productsFor($id, true);
        }
        return $supplier;
    }

    public static function productsFor(string $supplierId, bool $withVariations = true): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM products WHERE supplier_id = ? ORDER BY sort_order, name'
        );
        $stmt->execute([$supplierId]);
        $products = $stmt->fetchAll();
        if (!$withVariations) {
            return $products;
        }
        foreach ($products as &$product) {
            $product['variations'] = self::variationsFor($product['id']);
        }
        return $products;
    }

    public static function variationsFor(string $productId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM product_variations WHERE product_id = ? ORDER BY sort_order, name'
        );
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    public static function delete(string $id): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM suppliers WHERE id = ?');
        $stmt->execute([$id]);
    }

    public static function save(array $input, ?string $existingId = null): array
    {
        $pdo = Database::pdo();
        $pdo->beginTransaction();
        try {
            $id = $existingId ?: unique_slug(
                (string) ($input['id'] ?? $input['name']),
                static function (string $candidate) use ($pdo): bool {
                    $check = $pdo->prepare('SELECT 1 FROM suppliers WHERE id = ?');
                    $check->execute([$candidate]);
                    return (bool) $check->fetchColumn();
                },
            );

            if ($existingId) {
                $stmt = $pdo->prepare(
                    'UPDATE suppliers SET name=?, region=?, specialty=?, lead_time=?, image=?, image_alt=?, blurb=? WHERE id=?'
                );
                $stmt->execute([
                    $input['name'],
                    $input['region'],
                    $input['specialty'],
                    $input['lead_time'],
                    $input['image'],
                    $input['image_alt'],
                    $input['blurb'],
                    $id,
                ]);
                $pdo->prepare('DELETE FROM products WHERE supplier_id = ?')->execute([$id]);
            } else {
                $count = (int) $pdo->query('SELECT COUNT(*) FROM suppliers')->fetchColumn();
                $stmt = $pdo->prepare(
                    'INSERT INTO suppliers (id, name, region, specialty, lead_time, image, image_alt, blurb, sort_order)
                     VALUES (?,?,?,?,?,?,?,?,?)'
                );
                $stmt->execute([
                    $id,
                    $input['name'],
                    $input['region'],
                    $input['specialty'],
                    $input['lead_time'],
                    $input['image'],
                    $input['image_alt'],
                    $input['blurb'],
                    $count,
                ]);
            }

            $usedProductIds = [];
            foreach (array_values($input['products'] ?? []) as $pIndex => $product) {
                if (trim((string) ($product['name'] ?? '')) === '') {
                    continue;
                }
                $preferred = trim((string) ($product['id'] ?? ''));
                $productId = $preferred !== '' && !isset($usedProductIds[$preferred])
                    ? $preferred
                    : unique_slug((string) $product['name'], static fn ($c) => isset($usedProductIds[$c]));
                $usedProductIds[$productId] = true;

                $priceEx = self::money((float) $product['price_ex_vat']);
                $priceIncl = self::money((float) $product['price_incl_vat']);

                $pdo->prepare(
                    'INSERT INTO products
                    (id, supplier_id, name, unit, category, image, image_alt, price_ex_vat, price_incl_vat, sort_order)
                    VALUES (?,?,?,?,?,?,?,?,?,?)'
                )->execute([
                    $productId,
                    $id,
                    trim((string) $product['name']),
                    trim((string) $product['unit']),
                    trim((string) ($product['category'] ?? '')),
                    trim((string) ($product['image'] ?? '')),
                    trim((string) ($product['image_alt'] ?? $product['name'])),
                    $priceEx,
                    $priceIncl,
                    $pIndex,
                ]);

                $usedVarIds = [];
                foreach (array_values($product['variations'] ?? []) as $vIndex => $variation) {
                    if (trim((string) ($variation['name'] ?? '')) === '') {
                        continue;
                    }
                    $vPreferred = trim((string) ($variation['id'] ?? ''));
                    $variationId = $vPreferred !== '' && !isset($usedVarIds[$vPreferred])
                        ? $vPreferred
                        : unique_slug((string) $variation['name'], static fn ($c) => isset($usedVarIds[$c]));
                    $usedVarIds[$variationId] = true;

                    $vUnit = trim((string) ($variation['unit'] ?? '')) ?: trim((string) $product['unit']);
                    $vEx = isset($variation['price_ex_vat']) && $variation['price_ex_vat'] !== ''
                        ? self::money((float) $variation['price_ex_vat'])
                        : $priceEx;
                    $vIncl = isset($variation['price_incl_vat']) && $variation['price_incl_vat'] !== ''
                        ? self::money((float) $variation['price_incl_vat'])
                        : $priceIncl;

                    $pdo->prepare(
                        'INSERT INTO product_variations
                        (id, product_id, name, unit, image, image_alt, price_ex_vat, price_incl_vat, sort_order)
                        VALUES (?,?,?,?,?,?,?,?,?)'
                    )->execute([
                        $variationId,
                        $productId,
                        trim((string) $variation['name']),
                        $vUnit,
                        trim((string) ($variation['image'] ?? '')),
                        trim((string) ($variation['image_alt'] ?? $variation['name'])),
                        $vEx,
                        $vIncl,
                        $vIndex,
                    ]);
                }
            }

            $pdo->commit();
            return self::find($id) ?? ['id' => $id];
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    private static function money(float $value): float
    {
        if (!is_finite($value) || $value < 0) {
            throw new InvalidArgumentException('Prices must be non-negative numbers.');
        }
        return money_round($value);
    }

    /** Shape products for templates; redact prices when needed. */
    public static function presentProduct(array $product, bool $showPrices): array
    {
        $variations = [];
        foreach ($product['variations'] ?? [] as $variation) {
            $variations[] = [
                'id' => $variation['id'],
                'name' => $variation['name'],
                'unit' => $variation['unit'],
                'image' => $variation['image'],
                'image_alt' => $variation['image_alt'],
                'price_ex_vat' => $showPrices ? (float) $variation['price_ex_vat'] : null,
                'price_incl_vat' => $showPrices ? (float) $variation['price_incl_vat'] : null,
            ];
        }

        return [
            'id' => $product['id'],
            'name' => $product['name'],
            'unit' => $product['unit'],
            'category' => $product['category'],
            'image' => $product['image'],
            'image_alt' => $product['image_alt'],
            'price_ex_vat' => $showPrices ? (float) $product['price_ex_vat'] : null,
            'price_incl_vat' => $showPrices ? (float) $product['price_incl_vat'] : null,
            'variations' => $variations,
        ];
    }
}
