<?php

declare(strict_types=1);

/**
 * Import sql/schema.sql and seed suppliers from data/catalog.json
 * Usage: php sql/seed.php
 */

$root = dirname(__DIR__);
require $root . '/app/helpers.php';
require $root . '/app/Database.php';
require $root . '/app/Models/Supplier.php';

$configPath = $root . '/config.php';
if (!is_file($configPath)) {
    copy($root . '/config.example.php', $configPath);
    echo "Created config.php from example.\n";
}

$cfg = require $configPath;
date_default_timezone_set($cfg['timezone'] ?? 'Africa/Johannesburg');

$socket = trim((string) ($cfg['db']['socket'] ?? ''));
if ($socket !== '' && is_readable($socket)) {
    $dsn = sprintf('mysql:unix_socket=%s;charset=utf8mb4', $socket);
} else {
    $dsn = sprintf(
        'mysql:host=%s;port=%d;charset=utf8mb4',
        $cfg['db']['host'],
        (int) ($cfg['db']['port'] ?? 3306),
    );
}

$pdo = new PDO($dsn, $cfg['db']['user'], $cfg['db']['pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);
$pdo->exec('CREATE DATABASE IF NOT EXISTS `' . str_replace('`', '``', $cfg['db']['name']) . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
$pdo->exec('USE `' . str_replace('`', '``', $cfg['db']['name']) . '`');

$schema = file_get_contents($root . '/sql/schema.sql');
$pdo->exec($schema);
echo "Schema applied.\n";

$catalog = json_decode((string) file_get_contents($root . '/data/catalog.json'), true);
if (!is_array($catalog)) {
    fwrite(STDERR, "Could not read data/catalog.json\n");
    exit(1);
}

foreach ($catalog['suppliers'] as $supplier) {
    $products = [];
    foreach ($supplier['products'] as $product) {
        $variations = [];
        foreach ($product['variations'] ?? [] as $variation) {
            $variations[] = [
                'id' => $variation['id'],
                'name' => $variation['name'],
                'unit' => $variation['unit'],
                'image' => $variation['image'] ?? '',
                'image_alt' => $variation['imageAlt'] ?? $variation['name'],
                'price_ex_vat' => $variation['priceExVat'],
                'price_incl_vat' => $variation['priceInclVat'],
            ];
        }
        $products[] = [
            'id' => $product['id'],
            'name' => $product['name'],
            'unit' => $product['unit'],
            'category' => $product['category'],
            'image' => $product['image'] ?? '',
            'image_alt' => $product['imageAlt'] ?? $product['name'],
            'price_ex_vat' => $product['priceExVat'],
            'price_incl_vat' => $product['priceInclVat'],
            'variations' => $variations,
        ];
    }

    Supplier::save([
        'id' => $supplier['id'],
        'name' => $supplier['name'],
        'region' => $supplier['region'],
        'specialty' => $supplier['specialty'],
        'lead_time' => $supplier['leadTime'],
        'image' => $supplier['image'],
        'image_alt' => $supplier['imageAlt'],
        'blurb' => $supplier['blurb'],
        'products' => $products,
    ], null);
    echo "Seeded {$supplier['name']}\n";
}

echo "Done.\n";
