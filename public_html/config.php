<?php
/**
 * Fieldworx config template for Xneelo / LAMP.
 * Copy to config.php and fill in your MySQL details.
 *
 * When the website and database are on different servers (common on Xneelo),
 * set db.host to the MySQL hostname from the control panel — not localhost —
 * and leave db.socket as ''.
 */
return [
    'app_name' => 'Fieldworx',
    'base_url' => '', // e.g. '' for domain root, or '/fieldworx' if in a subfolder
    'timezone' => 'Africa/Johannesburg',

    'db' => [
        // Remote MySQL hostname from your host panel, e.g. 'sql12.xneelo.com'
        // Use 'localhost' / '127.0.0.1' only when PHP and MySQL are on the same machine.
        'host' => 'YOUR_MYSQL_HOST',
        'port' => 3306,
        'name' => 'YOUR_DATABASE_NAME',
        'user' => 'YOUR_DATABASE_USER',
        'pass' => 'YOUR_DATABASE_PASSWORD',
        'charset' => 'utf8mb4',
        // Leave empty for remote (or TCP) MySQL. Only set a path if your host
        // documents a local Unix socket and PHP runs on that same machine.
        'socket' => '',
    ],

    'admin_password' => 'fieldworx-admin',
    'session_name' => 'fieldworx_sess',

    'vat_rate' => 0.15,
];
