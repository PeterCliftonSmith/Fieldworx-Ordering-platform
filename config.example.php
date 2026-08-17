<?php
/**
 * Fieldworx config template for Xneelo / local LAMP.
 * Copy to config.php and fill in your MySQL details from the Xneelo control panel.
 */
return [
    'app_name' => 'Fieldworx',
    'base_url' => '', // e.g. '' for domain root, or '/fieldworx' if in a subfolder
    'timezone' => 'Africa/Johannesburg',

    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'fieldworx',
        'user' => 'fieldworx',
        'pass' => 'fieldworx',
        'charset' => 'utf8mb4',
        // On Xneelo, host is often localhost and the DB name/user come from the panel.
        'socket' => '/var/run/mysqld/mysqld.sock', // leave '' on Xneelo unless needed
    ],

    'admin_password' => 'fieldworx-admin',
    'session_name' => 'fieldworx_sess',

    'vat_rate' => 0.15,
];
