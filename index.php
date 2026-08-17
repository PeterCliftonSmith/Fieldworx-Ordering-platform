<?php

declare(strict_types=1);

require __DIR__ . '/app/bootstrap.php';

$router = new Router();

$router->get('/', [HomeController::class, 'index']);
$router->get('/how-it-works', [HomeController::class, 'howItWorks']);

$router->get('/suppliers', [SupplierController::class, 'index']);
$router->get('/suppliers/{id}', [SupplierController::class, 'show']);

$router->get('/login', [AuthController::class, 'loginForm']);
$router->post('/login', [AuthController::class, 'login']);
$router->post('/logout', [AuthController::class, 'logout']);

$router->get('/register', [RegisterController::class, 'form']);
$router->post('/register', [RegisterController::class, 'submit']);

$router->get('/order', [OrderController::class, 'draft']);
$router->post('/api/orders', [OrderController::class, 'submit']);
$router->get('/orders', [OrderController::class, 'history']);
$router->get('/orders/{id}', [OrderController::class, 'show']);

$router->get('/admin/login', [DashboardController::class, 'loginForm']);
$router->post('/admin/login', [DashboardController::class, 'login']);
$router->post('/admin/logout', [DashboardController::class, 'logout']);
$router->get('/admin', [DashboardController::class, 'index']);

$router->get('/admin/suppliers/new', [SupplierAdminController::class, 'createForm']);
$router->post('/admin/suppliers/new', static fn () => SupplierAdminController::save(null));
$router->get('/admin/suppliers/{id}', [SupplierAdminController::class, 'editForm']);
$router->post('/admin/suppliers/{id}', [SupplierAdminController::class, 'save']);
$router->post('/admin/suppliers/{id}/delete', [SupplierAdminController::class, 'delete']);

$router->get('/admin/registrations', [RegistrationAdminController::class, 'index']);
$router->get('/admin/registrations/{id}', [RegistrationAdminController::class, 'show']);
$router->post('/admin/registrations/{id}', [RegistrationAdminController::class, 'decide']);

$router->dispatch(request_method(), current_path());
