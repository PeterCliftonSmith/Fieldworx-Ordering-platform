<?php

declare(strict_types=1);

final class SupplierAdminController
{
    public static function createForm(): void
    {
        Auth::requireAdmin();
        render('admin/supplier-form', [
            'title' => 'Add supplier',
            'mode' => 'create',
            'supplier' => null,
            'error' => null,
        ], 'admin-layout');
    }

    public static function editForm(string $id): void
    {
        Auth::requireAdmin();
        $supplier = Supplier::find($id);
        if (!$supplier) {
            http_response_code(404);
            render('errors/404', ['title' => 'Not found'], 'admin-layout');
            return;
        }
        render('admin/supplier-form', [
            'title' => 'Edit ' . $supplier['name'],
            'mode' => 'edit',
            'supplier' => $supplier,
            'error' => null,
        ], 'admin-layout');
    }

    public static function save(?string $id = null): void
    {
        Auth::requireAdmin();
        verify_csrf();

        try {
            $products = self::parseProductsFromPost();
            $payload = [
                'name' => trim((string) post('name')),
                'region' => trim((string) post('region')),
                'specialty' => trim((string) post('specialty')),
                'lead_time' => trim((string) post('lead_time')),
                'image' => trim((string) post('image')),
                'image_alt' => trim((string) post('image_alt')),
                'blurb' => trim((string) post('blurb')),
                'products' => $products,
            ];
            foreach (['name', 'region', 'specialty', 'lead_time', 'image', 'image_alt', 'blurb'] as $field) {
                if ($payload[$field] === '') {
                    throw new InvalidArgumentException('All supplier details are required.');
                }
            }
            if ($products === []) {
                throw new InvalidArgumentException('Add at least one product.');
            }

            $saved = Supplier::save($payload, $id);
            flash_set(
                'success',
                sprintf(
                    'Saved %s with %d product(s).',
                    $saved['name'] ?? 'supplier',
                    count($saved['products'] ?? []),
                ),
            );
            redirect('/admin/suppliers/' . rawurlencode((string) $saved['id']));
        } catch (Throwable $e) {
            $supplier = $id ? Supplier::find($id) : null;
            render('admin/supplier-form', [
                'title' => $id ? 'Edit supplier' : 'Add supplier',
                'mode' => $id ? 'edit' : 'create',
                'supplier' => $supplier,
                'error' => $e->getMessage(),
                'posted' => $_POST,
            ], 'admin-layout');
        }
    }

    public static function delete(string $id): void
    {
        Auth::requireAdmin();
        verify_csrf();
        Supplier::delete($id);
        flash_set('success', 'Supplier removed.');
        redirect('/admin');
    }

    private static function parseProductsFromPost(): array
    {
        $names = $_POST['product_name'] ?? [];
        if (!is_array($names)) {
            return [];
        }

        $products = [];
        foreach ($names as $index => $name) {
            $name = trim((string) $name);
            if ($name === '') {
                continue;
            }
            $unit = trim((string) ($_POST['product_unit'][$index] ?? ''));
            $priceEx = (string) ($_POST['product_price_ex'][$index] ?? '');
            $priceIncl = (string) ($_POST['product_price_incl'][$index] ?? '');
            if ($unit === '' || $priceEx === '' || $priceIncl === '') {
                throw new InvalidArgumentException("Unit and prices are required for {$name}.");
            }

            $variations = [];
            $varNames = $_POST['variation_name'][$index] ?? [];
            if (is_array($varNames)) {
                foreach ($varNames as $vIndex => $vName) {
                    $vName = trim((string) $vName);
                    if ($vName === '') {
                        continue;
                    }
                    $vUnit = trim((string) ($_POST['variation_unit'][$index][$vIndex] ?? '')) ?: $unit;
                    $vEx = (string) ($_POST['variation_price_ex'][$index][$vIndex] ?? '');
                    $vIncl = (string) ($_POST['variation_price_incl'][$index][$vIndex] ?? '');
                    if ($vEx === '') {
                        $vEx = $priceEx;
                    }
                    if ($vIncl === '') {
                        $vIncl = $priceIncl;
                    }
                    $variations[] = [
                        'id' => trim((string) ($_POST['variation_id'][$index][$vIndex] ?? '')),
                        'name' => $vName,
                        'unit' => $vUnit,
                        'image' => trim((string) ($_POST['variation_image'][$index][$vIndex] ?? '')),
                        'image_alt' => trim((string) ($_POST['variation_image_alt'][$index][$vIndex] ?? $vName)),
                        'price_ex_vat' => $vEx,
                        'price_incl_vat' => $vIncl,
                    ];
                }
            }

            $products[] = [
                'id' => trim((string) ($_POST['product_id'][$index] ?? '')),
                'name' => $name,
                'unit' => $unit,
                'category' => trim((string) ($_POST['product_category'][$index] ?? '')),
                'image' => trim((string) ($_POST['product_image'][$index] ?? '')),
                'image_alt' => trim((string) ($_POST['product_image_alt'][$index] ?? $name)),
                'price_ex_vat' => $priceEx,
                'price_incl_vat' => $priceIncl,
                'variations' => $variations,
            ];
        }

        return $products;
    }
}
