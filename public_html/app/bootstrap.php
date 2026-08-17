<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Router.php';
require_once __DIR__ . '/Models/Supplier.php';
require_once __DIR__ . '/Models/Registration.php';
require_once __DIR__ . '/Models/Order.php';
require_once __DIR__ . '/Controllers/HomeController.php';
require_once __DIR__ . '/Controllers/SupplierController.php';
require_once __DIR__ . '/Controllers/AuthController.php';
require_once __DIR__ . '/Controllers/RegisterController.php';
require_once __DIR__ . '/Controllers/OrderController.php';
require_once __DIR__ . '/Controllers/Admin/DashboardController.php';
require_once __DIR__ . '/Controllers/Admin/SupplierAdminController.php';
require_once __DIR__ . '/Controllers/Admin/RegistrationAdminController.php';

date_default_timezone_set(app_config()['timezone'] ?? 'Africa/Johannesburg');
Auth::startSession();

if (!headers_sent()) {
    header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
}